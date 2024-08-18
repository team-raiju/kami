### Mapaeamento

#### Posição do Robô na Pista

<figure>
    <img src="images/raijin/robot_position.png" alt="Raijin">
    <figcaption>Posicionamento do robô</figcaption>
</figure>

Para mapear a pista, o robô a segue com controle PID padrão numa velocidade estável, a cada 1ms a posição estimada do robô é atualizada e salva.

Para estimar a posição, são usados o encoder e a IMU, com o encoder:

$\Delta S_{lado} = \Delta S_{lado} + E_{lado} * \frac{2*\pi*R}{PPR}$

Onde:

|                   |                                                              |
| ----------------- | ------------------------------------------------------------ |
| $\Delta S_{lado}$ | deslocamento total do robô (lado = esquerda ou direita)      |
| $E_{lado}$        | número de pulsos do encoder lidos desde a última atualização |
| $R$               | raio da roda em cm                                           |
| $PPR$             | Pulsos (do encoder) Por Revolução (da roda)                  |

<br />

Com a IMU:

$\theta = \theta_{anterior} + \omega_{z} * \Delta t$

Onde:

|                     |                                                 |
| ------------------- | ----------------------------------------------- |
| $\theta$            | ângulo do robô no eixo z                        |
| $\theta_{anterior}$ | ângulo do robô na última atualização de posição |
| $\omega_{z}$        | velocidade ângular medida pela IMU no eixo z    |
| $\Delta t$          | intervalo de tempo entre duas medições          |

<br />

Assim, para obter a posição (x, y):

$\Delta S_{atual} = \frac{(\Delta S_{esquerda} + \Delta S_{direita})}{2}$

$x = x_{anterior} + \Delta S_{atual} * \cos{(-\theta)}$

$y = y_{anterior} + \Delta S_{atual} * \sin{(-\theta)}$

> O sinal do ângulo do robô $(-\theta)$ depende da orientação dos dados da IMU e de qual referêncial se deseja para o robô.

#### Curvatura da Pista

A informação de fato utilizada é a curvatura da pista, com os dados acima armazenados a cada 5cm:

<figure>
    <img src="images/raijin/curvature.png" alt="Raijin">
    <figcaption>Curvatura</figcaption>
</figure>

$ \Delta \theta = \frac{d}{R} =>$

$ R = \frac{d}{\Delta \theta}$

$ \kappa = \frac{1}{R}$

Onde:

|                 |                                         |
| --------------- | --------------------------------------- |
| $\Delta \theta$ | variação de ângulo do robô, em radianos |
| d               | deslocamento do robô (nesse caso, 5 cm) |
| $R$             | raio da pista no trecho                 |
| $\kappa$        | curvatura da pista no trecho            |

Após realizar esse cálculo para todos os trechos, tem-se uma lista de todos os raios da pista.

Essa informação é salva na memória não volátil e é utilizada na tomada de tempo, o robô pode aumentar sua velocidade em trechos com R maior (retas) e diminuir em trechos com R menor.

Com isso, o robô não depende de marcações laterais para identificar curvas, utilizando-as apenas para correção de posição, isso permite um mapeamento mais genérico para qualquer tipo de pista.

#### Implementação do Mapeamento

A implementação real das contas mostradas acima pode ser vista abaixo:

```C
static int8_t estimate_radius(float current_theta, float last_theta, float travelled_dist_cm, float previous_travelled_dist_cm) {
    float delta_theta = current_theta - last_theta;
    /* Assume maximum delta theta between two measures is 180 degrees */
    if (delta_theta > M_PI) {
        delta_theta -= M_PI_X_2;
    } else if (delta_theta < -M_PI) {
        delta_theta += M_PI_X_2;
    }

    float current_radius_cm = STRAIGHT_RADIUS_CM;
    if (fabs(delta_theta) > 0.0175) { /* 0.0175 = 1 degree */
        current_radius_cm = (travelled_dist_cm - previous_travelled_dist_cm) / delta_theta;
    }

    int8_t radius_int = constrain(current_radius_cm, -STRAIGHT_RADIUS_CM, STRAIGHT_RADIUS_CM);

    return radius_int;
}

void process_save_track() {
    float current_travelled_dist_cm = get_travelled_distance();
    if (current_travelled_dist_cm > (waypoint_idx + 1) * WAYPOINT_DISTANCE_CM) {
        point_t pos = get_estimated_position();
        uint16_t idx_to_save = (current_travelled_dist_cm / WAYPOINT_DISTANCE_CM) - 1;

        float current_theta = get_estimated_angle();
        int8_t radius_int = estimate_radius(current_theta, last_theta, current_travelled_dist_cm, last_travelled_dist_cm);

        //...

        update_goal_list(pos, waypoint_idx);
        update_radius_list(radius_int, waypoint_idx);
        DEBUG_PRINT("Goal[%d]: %f, %f\r\n", waypoint_idx, pos.x, pos.y);

        last_travelled_dist_cm = current_travelled_dist_cm;
        last_theta = current_theta;
        waypoint_idx++;
    }
}
```

Ao final do mapeamento há um array de curvaturas de tal forma que:

- radius_list[0] = curvatura entre 0 e 5cm da pista
- radius_list[1] = curvatura entre 5 e 10cm da pista
- radius_list[2] = curvatura entre 10 e 15cm da pista
- radius_list[N] = curvatura entre N*5 e (N+1) * 5cm da pista

Utiliza-se apenas um byte para salvar a curvatura da pista, sendo possíveis raios de -127 a 127cm. Raios maiores que 100cm são considerados retas e o menor raio permitido nas regras é 10cm.

#### Implementação Target Velocity

Com a lista de raios salva, pode-se calcular a velocidade por trecho. Isso é calculado antes do robô partir e salvo em outra lista. Por exemplo, a função abaixo gera velocidades quadraticamente (proporcional a $R²$). Mas outras opções existem, como linear.

```C
/* Quadradic */
static float radius_to_velocity_1(uint8_t radius_cm_abs) {
    float velocity =
        ((radius_cm_abs * radius_cm_abs) / (STRAIGHT_RADIUS_CM * STRAIGHT_RADIUS_CM))
        * (pid_max_velocity_m_s - pid_min_velocity_m_s)
        + pid_min_velocity_m_s;

    return constrain(velocity, pid_min_velocity_m_s, pid_max_velocity_m_s);
}
```

Por fim, há um processamento de filtragem de valores possivelmente inválidos e de freio. Antes de uma mudança de curvatura, por exemplo, a velocidade é diminuída.

```C
/* Filter some values that might be wrong in the table */
static void filter_velocity_table() {
    for (int i = 1; i < waypoint_list_lenght - 1; i++) {
        float previous_velocity = velocity_table_m_s[i - 1];
        float current_velocity = velocity_table_m_s[i];
        float next_velocity = velocity_table_m_s[i + 1];

        if ((previous_velocity == next_velocity) && (current_velocity != previous_velocity)) {
            velocity_table_m_s[i] = previous_velocity;
        }
    }
}

/* Adds breaks before turns */
static void add_break_before_turn(uint8_t break_size) {
    if (break_size == 0) {
        return;
    }

    for (int i = 0; i < waypoint_list_lenght - 2; i++) {
        float v_diff_1 = velocity_table_m_s[i + 1] - velocity_table_m_s[i];
        float v_diff_2 = velocity_table_m_s[i + 2] - velocity_table_m_s[i];

        /* Find if we are breaking and break "break_size" steps before*/
        if ((v_diff_1 < 0) && (v_diff_2 < 0)) {
            for (int j = 0; j < break_size; j++) {
                if ((i - j) < 0) {
                    break;
                }

                /* Only change velocity if velocity was grater */
                if (velocity_table_m_s[i - j] > velocity_table_m_s[i + 1]) {
                    velocity_table_m_s[i - j] = velocity_table_m_s[i + 1];
                }
            }
        }
    }
}
```

Com a tabela de velocidade calculada, basta mudar o target de velocidade do PID de acordo com o ponto em que o robô se encontra na pista.

```C
int8_t curvature_pid_process(float *target_max_speed, float *current_radius) {
    float current_travelled_dist_cm = get_travelled_distance();

    if (current_travelled_dist_cm > (waypoint_idx + 1) * WAYPOINT_DISTANCE_CM) {
        uint16_t idx_to_read = (current_travelled_dist_cm / WAYPOINT_DISTANCE_CM) - 1;
        idx_to_read = min(idx_to_read, waypoint_list_lenght - 1);

        *target_max_speed = velocity_table_m_s[idx_to_read];
        *current_radius = get_radius_list(idx_to_read);

        waypoint_idx = idx_to_read + 1;

        return 0;
    }

    return -3;
}
```

O cálculo de PID é dado por:

```C
speed_pid_l = target_speed_m_s - rotation_ratio;
speed_pid_r = target_speed_m_s + rotation_ratio;
drive_m_s(speed_pid_l, speed_pid_r);
```

> rotation_ratio é obtido pelo cálculo do PID e sensores de linha e target_speed_m_s é tirado dos cálculos de raios da pista.

#### Implementação da Aceleração

É possível que a cada 5cm ocorra uma mudança muito brusca de velocidade, como na mudança de uma reta para uma curva muito fechada. Para suavizar a aceleração e conseguir valores que o motor consiga seguir, a velocidade muda gradualmente. A velocidade da lista `velocity_table_m_s` vira então a velocidade _máxima_ no trecho (`max_speed`) e a `target_speed_m_s` passa a depender da aceleração.

```C
#define CONTROL_LOOP_PERIOD_MS  1

if (target_speed_m_s < max_speed) {
    target_speed_m_s += ((float)parameters.max_acc) * (0.001 * CONTROL_LOOP_PERIOD_MS);
    if (target_speed_m_s > max_speed) {
        target_speed_m_s = max_speed;
    }
} else if (target_speed_m_s > max_speed) {
    target_speed_m_s -= ((float)parameters.max_break) * (0.001 * CONTROL_LOOP_PERIOD_MS);
    if (target_speed_m_s < max_speed) {
        target_speed_m_s = max_speed;
    }
}
```

#### Correção de posição

Como mencionado, as marcações laterais da pista servem para que o robô possa corrigir sua posição. Durante o mapeamento a posição de cada marcação lateral também é salva e com isso o robô sabe quanto _deveria ser_ a distância percorrida até aquele momento. Assim, durante a volta otimizada, isso é usado para corrigir a distância que o robô acha que percorreu.

```C
int8_t curvature_pid_fix_dist(uint8_t *marker_counter) {
    float expected_dist = get_left_markers_dist_list(*marker_counter);
    float current_dist = get_travelled_distance();

    if (fabs(current_dist - expected_dist) < MAX_ERROR_TO_FIX_CM) {
        update_travelled_distance(expected_dist);
        return 0;
    }
}
```

Caso o erro seja muito grande, há uma lógica para voltar para a marcação anterior ou avançar para a próxima, o que pode ocorrer caso alguma leitura seja perdida.

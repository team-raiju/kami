A implementação é um controle PID clássico.

#### PID dos Sensores

O Erro é calculado com base no valor analógico lido pelos sensores. Que foi previamente calibrado para ler de 0 (branco) a 1000 (preto).

Para a calibração dos sensores:

```C
float coefficient = 1000.0 / (max_values[i] - min_values[i]);
uint16_t offset = min_values[i];
```

- max_values[i] -> maior valor lido durante o estágio de calibração para o sensor i
- min_values[i] -> menor valor lido durante o estágio de calibração para o sensor i

Para pegar o valor nessa escala, a cada leitura:

```C
line_sensor_scaled[i] = sensor_coefficients[i] * (line_sensor_raw[i] - sensor_offsets[i]);
```

Com esse valor, podemos fazer o cáculo do erro no PID com base nos 16 sensores, com uma média ponderada:

```C
// weight = 3.8 - 0.4*i
float average_left = (line_array_get_scaled(0) * 3.8 + line_array_get_scaled(1) * 3.4 + line_array_get_scaled(2) * 3.0 +
                    line_array_get_scaled(3) * 2.6 + line_array_get_scaled(4) * 2.2 + line_array_get_scaled(5) * 1.8 +
                    line_array_get_scaled(6) * 1.4 + line_array_get_scaled(7) * 1.0) / 8.0;

float average_right = (line_array_get_scaled(8) * 1.0 + line_array_get_scaled(9) * 1.4 + line_array_get_scaled(10) * 1.8 +
                    line_array_get_scaled(11) * 2.2 + line_array_get_scaled(12) * 2.6 + line_array_get_scaled(13) * 3.0 +
                    line_array_get_scaled(14) * 3.4 + line_array_get_scaled(15) * 3.8) / 8.0;

float error = ((average_right - average_left) / 10.0);

float derivative = error - last_error_pid;
integral_pid += error;

float rotation_ratio = ((error * pid_kp) + (derivative * pid_kd) + (integral_pid * pid_ki)) / PID_MULTIPLICATION_FACTOR;

last_error_pid = error;
```

`rotation_ratio` é então usado no cálculo da velocidade mostrado acima.

#### PID de Velocidade

Ainda não é utilizado no projeto. Em breve atualizações.

#### Controle do brushless

Os brushless das ventoinhas são controlados com base na leitura da bateria, assim, mesmo com a queda da tensão da bateria durante a volta, a PWM se adapta para manter a tensão dos brushless constante.

Para isso, durante o loop principal:

```C
#define REFERENCE_VOLTAGE_MV (11000.0)
#define MAX_SPEED (100)

void bsp_brushless_set_with_bat(uint16_t bat_mv, uint8_t speed)
{
    speed = min(speed, MAX_SPEED);
    current_speed = speed;

    if (speed == 0) {
        bsp_brushless_set(0);
    }

    float brushless_target_voltage = (speed / 100.0) * REFERENCE_VOLTAGE_MV;
    float duty_cycle = brushless_target_voltage / (float)bat_mv;
    bsp_brushless_set(duty_cycle * 100.0f);
}
```

### Parâmetros

Diversos parâmetros podem ser controlados pelo bluetooth. Facilitando ajustes rápidos e testes:

| Parametro                | Descrição                                                      |
| ------------------------ | -------------------------------------------------------------- |
| enabled_line_sensors     | Quais dos 16 sensores estão ativos                             |
| enabled_side_sensors     | Quais dos 4 sensores laterais estão ativos                     |
| base_speed               | Velocidade base no PID padrão                                  |
| kp                       | KP do PID padrão                                               |
| kd                       | KD do PID padrão                                               |
| ki                       | Ki do PID padrão                                               |
| track_base_speed         | Velocidade base no mapeamento                                  |
| track_kp                 | KP do PID do mapeamento                                        |
| track_kd                 | KD do PID do mapeamento                                        |
| track_ki                 | KI do PID do mapeamento                                        |
| brushless_speed          | Velocidade para motores brushless                              |
| marker_timeout           | Timeout para considerar marcação lateral                       |
| min_left_markers         | Mínimo de marcaçãoes esquerdas antes de ler a marcação direita |
| curvature_pid_max_vel    | Velocidade máxima para retas no PID otimizado                  |
| curvature_pid_min_vel    | Velocidade mínima para curvas no PID otimizado                 |
| break_before_turn        | Quantos cm vai freiar antes de uma curva                       |
| max_acc                  | Máxima aceleração                                              |
| max_break                | Máximo freio                                                   |
| z_imu_bias               | Bias do eixo Z da IMU                                          |
| brushless_straight_speed | Velocidade para retas com motores brushless                    |
| vel_control_enabled      | Controle de velocidade ativado/desativado                      |
| vel_kp                   | KP do PID para controle de velocidade                          |
| vel_ki                   | KI do PID para controle de velocidade                          |

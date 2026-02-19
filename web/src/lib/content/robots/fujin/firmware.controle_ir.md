O sensor IR também é utilizado para garantir que o robô se mantanha no meio da célula quando está andando em uma reta. Para isso temos um valor de referência da leitura do robô no meio da célula (ir_wall_dist_ref). O objetivo é que o robô sempre esteja em uma posição, cujo o erro em relação a essa distancia de referência seja 0.

O erro do robô em relação à essa referência é calculado assim no código:

```cpp
int32_t ir_side_wall_error() {
    int32_t left_error = ir_readings[SensingDirection::LEFT] - services::Config::ir_wall_dist_ref_left;
    int32_t right_error = ir_readings[SensingDirection::RIGHT] - services::Config::ir_wall_dist_ref_right;

    int32_t ir_error;
    if (ir_wall_control_valid(SensingDirection::LEFT) && ir_wall_control_valid(SensingDirection::RIGHT)) {
        ir_error = left_error - right_error;
    } else if (ir_wall_control_valid(SensingDirection::LEFT)) {
        ir_error = 2.0 * left_error;
    } else if (ir_wall_control_valid(SensingDirection::RIGHT)) {
        ir_error = -2.0 * right_error;
    } else {
        ir_error = 0;
    }

    return ir_error;
}

bool ir_wall_control_valid(SensingDirection direction) {
    switch (direction) {
    case SensingDirection::RIGHT:
        return ir_readings[direction] > services::Config::ir_wall_control_th_right;
    case SensingDirection::FRONT_LEFT:
        return ir_readings[direction] > services::Config::ir_wall_control_th_front_left;
    case SensingDirection::FRONT_RIGHT:
        return ir_readings[direction] > services::Config::ir_wall_control_th_front_right;
    case SensingDirection::LEFT:
        return ir_readings[direction] > services::Config::ir_wall_control_th_left;
    default:
        return false;
    }
}
```

A função `ir_wall_control_valid` checa se a leitura atual do sensor, permite o controle por meio de parede. Se o valor de leitura do sensor é muito baixo, indica que o robô está em uma célula que não possui parede naquele lado. Dessa forma, não podemos utilizar o valor do sensor para calcular o erro de posição do robô.

Uma observação, é que esse erro no geral é pequeno. O principal método de fazer o robô ficar no meio da célula é por meio do controle de velocidade angular obtido pelo IMU.

Por último, o controle de posição utilizando os sensores IR quando o robô esta fazendo diagonal, é muito similar ao que foi comentado. A única diferença é que usa-se os sensores frontais (levemente inclinados) para isso.

```cpp
int32_t ir_diagonal_error() {
    bool greater_error_left = ir_readings[SensingDirection::FRONT_LEFT] > ir_readings[SensingDirection::FRONT_RIGHT];

    int32_t ir_error;

    if (greater_error_left && ir_wall_control_valid(SensingDirection::FRONT_LEFT)) {
        ir_error = ir_readings[SensingDirection::FRONT_LEFT] - services::Config::ir_wall_dist_ref_front_left;
    } else if (!greater_error_left && ir_wall_control_valid(SensingDirection::FRONT_RIGHT)) {
        ir_error = -(ir_readings[SensingDirection::FRONT_RIGHT] - services::Config::ir_wall_dist_ref_front_right);
    } else {
        ir_error = 0;
    }

    return ir_error;
}
```

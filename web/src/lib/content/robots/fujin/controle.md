Utilizamos controle PID para a velocidade linear e para a velocidade angular (ω_speed).

Somamos o resultado de cada um desses controles para achar a **corrente** (I) que o motor deve ter. De acordo com esse código:

```cpp
float mean_velocity_m_s = bsp::encoders::get_filtered_velocity_m_s();
auto angular_speed_error_raw = std::abs(target_angular_speed_rad_s - bsp::imu::get_rad_per_s());
auto linear_speed_error = std::abs(target_linear_speed_m_s - mean_velocity_m_s);
emergency = ((linear_speed_error > 1.0) || (angular_speed_error_raw > 17.0));

if (wall_pid_enabled) {
    target_angular_speed_rad_s += walls_pid.calculate(0.0, bsp::analog_sensors::ir_side_wall_error());
}

if (diagonal_pid_enabled) {
    target_angular_speed_rad_s += diagonal_walls_pid.calculate(0.0, bsp::analog_sensors::ir_diagonal_error());
}


float linear_ratio = linear_vel_pid.calculate(target_linear_speed_m_s, mean_velocity_m_s);
float rotation_ratio = -angular_vel_pid.calculate(target_angular_speed_rad_s, bsp::imu::get_rad_per_s());


float l_current = linear_ratio + rotation_ratio;
float r_current = linear_ratio - rotation_ratio;
```




A partir dessas correntes achadas pelo PID (l_current e r_current), utilizamos a informação de "Back-EMF" para calcular a PWM que o motor deve ter para manter essa corrente, dado que:

$$ V = E + I*R_{a}$$

e

$$ V = Duty * V_{battery}$$

e

$$ E = K_{t} * \omega$$


Em que:
- V = Tensão aplicada no motor (V)
- E = Força Contra Eletromotriz (back-EMF) (V)
- I = Corrente no motor (A) - (no caso r_current ou l_current do PID)
- $R_{a}$ = Resistencia no enrolamento (Ω)
- $V_{battery}$ = Tensão da bateria (V)
- Duty = Duty Cycle da PWM
- $K_{t}$ = Constante de torque do motor (Nm/A)
- $\omega$ = velocidade angular de giro do motor (rad/s)

Para achar o duty cycle, juntando as 3 fórmulas acima:

$$ Duty  = \frac{K_{t} * \omega + I * R_{a}}{V_{battery}} =>$$

Esse controle, é um "Feed Foward" que tenta compensar a Back-EMF ao invés do simples PID diretamente na tensão.

No código:
```cpp
float left_ang_vel = bsp::encoders::get_left_filtered_ang_vel_rad_s();
float right_ang_vel = bsp::encoders::get_right_filtered_ang_vel_rad_s();

pwm_duty_l = ((l_current * mot_ra + left_ang_vel * mot_kt) / bat_volts) * 1000;
pwm_duty_r = ((r_current * mot_ra + right_ang_vel * mot_kt) / bat_volts) * 1000;
```

Abaixo uma visão completa do diagrama de controle que gera as PWM no motor a cada 1ms:

<figure>
    <img src="/images/fujin/control_diagram.png" alt="control_diagram">
    <figcaption>control_diagram</figcaption>
</figure>

No código toda essa parte se encontra em `src/service/control.cpp`.

Idealmente, gostariamos de medir a corrente com um sensor de corrente e fazer o controle diretamente em cima dessa medição. Entretando como ainda não fazemos isso, utilizamos esse método descrito.

Para mais informações: https://qiita.com/tanutanup/items/1af11d4e586f49713468

------------------------------

Além disso temos mais um controle simples para manter a tensão da ventoinha constante. Para isso, a cada 1ms:

```cpp
/* Fan control */
float bat_volts = bsp::analog_sensors::battery_latest_reading_mv() / 1000.0;

float target_fan_speed = std::min(params.fan_speed, 1000.0f); // 0 à 1000
float desired_fan_voltage = (target_fan_speed / 1000.0f) * bsp::fan::get_max_fan_voltage();

if (bat_volts > 5.0) { // To avoid turning on fan when batery measurement is low
    uint16_t fan_pwm = (desired_fan_voltage / bat_volts) * 1000;
    bsp::fan::set(fan_pwm);
} else {
    bsp::fan::set(0);
}
```

Utilizamos controle PID para a velocidade linear e para a velocidade angular (ω_speed).

Somamos o resultado de cada um desses controles para achar a **corrente** (I) que o motor deve ter. A partir dessa corrente, utilizamos a informação de "Back-EMF" para calcular a PWM que o motor deve ter para manter essa corrente, dado que:

$$ V = E + I*R_{a}$$

e

$$ V = Duty * V_{battery}$$

e

$$ E = K_{t} * \omega$$


Em que:
- V = Tensão aplicada no motor (V)
- E = Força Contra Eletromotriz (back-EMF) (V)
- I = Corrente no motor (A)
- $R_{a}$ = Resistencia no enrolamento (Ω)
- $V_{battery}$ = Tensão da bateria (V)
- Duty = Duty Cycle da PWM
- $K_{t}$ = Constante de torque do motor (Nm/A)
- $\omega$ = velocidade angular de giro do motor (rad/s)

Para achar o duty cycle, juntando as 3 fórmulas acima:

$$ Duty  = \frac{K_{t} * \omega + I * R_{a}}{V_{battery}} =>$$

Esse controle, é um "Feed Foward" que tenta compensar a Back-EMF ao invés do simples PID diretamente na tensão.

Abaixo uma visão completa do diagrama de controle que gera as PWM no motor a cada 1ms:

<figure>
    <img src="/images/fujin/control_diagram.png" alt="control_diagram">
    <figcaption>control_diagram</figcaption>
</figure>

No código toda essa parte se encontra em `src/service/control.cpp`.

Idealmente, gostariamos de medir a corrente com um sensor de corrente e fazer o controle diretamente em cima dessa medição. Entretando como ainda não fazemos isso, utilizamos esse método descrito.

Para mais informações: https://qiita.com/tanutanup/items/1af11d4e586f49713468

------------------------------

Alem disso temos mais um controle simples para manter a tensão da ventoinha constante. Para isso, a cada 1ms:

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

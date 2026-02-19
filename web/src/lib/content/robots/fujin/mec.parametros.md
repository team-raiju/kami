Abaixo os parâmetros em que o robô foi calibrado, e ainda conseguia completar o labirinto. Note que tais parâmetros não são o máximo possível que o robô alcança em teoria, mas sim, o máximo que o controle fica estável o suficiente para completar o labirinto.

| Parâmetro  | Search Slow | Search Fast | Slow | Medium | Fast |
|------------|-------------|-------------|-------|--------| -----|
| PWM Succção [%] | 0.0 | 22 | 60 | 60 | 60 |
| Acceleration [m/s²] | 0.85 | 4.0 | 12.0 | 15.0 | 25.0 |
| Break [m/s²] | 0.85 | 6.0 | 20.0 | 20.0 | 30.0|
| Top Speed [m/s]  | 0.3 | 0.7 | 3.0 | 3.5 | 4.5 |
| Turn 45° Speed [m/s] | - | - | 1.0 | 1.5 | 1.5 |
| Turn 90° Speed [m/s] | 0.3 | 0.7 | 1.0 | 1.3 | 1.3 |
| Turn 135° Speed [m/s] | - | - | 1.0 | 1.5 | 1.5 |
| Turn 180° Speed [m/s] | - | - | 1.0 | 1.3 | 1.5 |
| Turn 45° from 45° Speed [m/s] | - | - | 1.0 | 1.5 | 1.5 |
| Turn 90° from 45° Speed [m/s] | - | - | 1.0 | 1.5 | 1.5 |
| Turn 135° from 45° Speed [m/s] | - | - | 1.0 | 1.5 | 1.5 |
| Turn Max Angular Speed [rad/s] | 5.5 | 15.7 | 20.94 | 26.18 | 26.18 |
| Turn Max Angular Acceleration [rad/s²] | 55.0 | 244.35 | 610.86 | 785.4 | 785.4 |

> Nota: A velocidade angular máxima e a aceleração angular máxima, não são iguais para todas as curvas, cada curva tem seu perfil de aceleração e velocidade angular, mas na tabela, colocamos o valor máximo dentre todos os perfils

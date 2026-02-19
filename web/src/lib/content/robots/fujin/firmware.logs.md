Uma parte bem importante para calibrar o micromouse é a coleta de logs e sua visualização. Sem isso, fica muito difícil calibrr o robô então acredito que ja deva ser pensado desde o começo do projeto.

No nosso caso, salvamos a cada 1ms todos os dados do robô e depois coletamos essas informações via USB.

Atualemnte estamos salvando os logs apenas na memória RAM e temos espaço para até 4 segundos de logs.

Os dados que salvamos são:
```cpp
velocity_ms;         // Velocidade atual em m/s
target_velocity_ms;  // Velocidade de objetivo do robô em m/s

angular_speed_rad_s; // Velocidade angular atual em rad/s
target_rad_s;        // Velocidade angular de objetivo em rad/s

pwm_left;            // PWM de 0 à 1000 atual do motor da esquerda
pwm_right;           // PWM de 0 à 1000 atual do motor da direita
battery;             // Tensão atual da bateria em mV

position_mm_x;       // Posição X do robô em relação ao começo do último movimento
position_mm_y;       // Posição Y do robô em relação ao começo do último movimento
angle;               // Angulo do robô em relação ao começo do último movimento
distance;            // Distância percorrida pelo robô desde o começo do último movimento
```

Pelo menu do robô conseguims solicitar essas informações que são enviadas por USB. Depois podemos colocar em um gráfico para saber se nosso controle está bom e ajustar as constantes de controle de acordo. Abaixo gráficos reais tirados do robô

<figure>
    <img src="/images/fujin/control_1.png" alt="control_1">
    <figcaption>control_1</figcaption>
</figure>

<figure>
    <img src="/images/fujin/control_2.png" alt="control_2">
    <figcaption>control_2</figcaption>
</figure>

<figure>
    <img src="/images/fujin/control_3.png" alt="control_3">
    <figcaption>control_3</figcaption>
</figure>

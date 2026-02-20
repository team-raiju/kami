Para uma estimativa inicial para prencher cada parametro do "turn_params" e "foward_param" ([Movimentos - Estrutura de Dados](#fw_mov_dados)), temos um script auxiliar no repositório em `scripts/velocity_planner.py`.

Esse script aceita como parâmetros de entrada os seguinte parâmetros:

```py
linear_speed_m_s = 1.2
turn_angle_deg = 90

angular_acceleration_deg_s2 = 35000
angular_desacceleration_deg_s2 = 35000
maximum_angular_speed_deg_s = 1340

mm_before_turn = 15
mm_after_turn = 15
initial_theta_deg = 0
```

E com base nisso calcula a trajetória do robô até percorrer "turn_angle_deg" graus a uma certa velocidade "linear_speed_m_s". Após o calculo da trajetória, ele nos retorna o tempo que o robô deve ter aceleração angular para realizar tal trajetória. Exemplo de output:


```
Max angular speed (deg/s):  1340  (= 23.387411976724017 rad/s)
Acceleration (deg/s^2):  35000  (= 610.8652381980154 rad/s^2)
Deceleration (deg/s^2):  35000  (= 610.8652381980154 rad/s^2)
t1 (ms):  38
t2 (ms):  29
t3 (ms):  38
T (ms) :  105

Angle until max speed (deg) : 0.000 to 25.651
Angle on max speed (deg)    : 25.651 to 64.349
Final angle (deg)           : 64.349 to 90.000

Reached max angular speed at t = 38 ms and angle = 24.605 deg -> 0.429 rad
Started deceleration at t = 67 ms and angle = 63.175 deg -> 1.103 rad
Final Real Position: 166.378, 90.174, 89.110
```

Assim, podemos usar esses dados para colocar na estrutura de dados do robô para ele realizar a trajetória desejada. No geral os parâmetros que esse script nos dá, fica bem próximo dos reais que utilizamos no robô, com apenas alguns milissegundos de diferença.

O programa também faz um plot da trajetória e da velocidade angular ao longo do tempo:

<figure>
    <img src="/images/fujin/velocity_planner_1.png" alt="velocity_planner_1">
    <figcaption>velocity_planner_1</figcaption>
</figure>

<figure>
    <img src="/images/fujin/velocity_planner_2.png" alt="velocity_planner_2">
    <figcaption>velocity_planner_2</figcaption>
</figure>

Um detalhe são os parâmetros `mm_before_turn` e `mm_after_turn`, eles significam o "quanto antes ou depois" do início da célula o movimento vai começar e o "quanto antes ou depois" ele vai terminar. Quando negativo indica que o movimento começa antes da célula e positivo depois. Isso é importante porque dependendo da velocidade não é possível fazer todo o movimento dentro de uma única célula e precisa começar um pouco antes ou um pouco depois.

Esses valores depois também entram na estrutura de dados para o robô começar o movimento no momento certo.

Dando um exemplo prático, no caso de uma sequencia "FOWARD, TURN_RIGHT_90", se o "TURN_RIGHT_90" precisar começar -1cm antes do começo da célula, o "FOWARD" anterior vai andar apenas 17cm ao invés do padrão 18cm.

Assim como se precisasse começar 1cm depois do começo da célula, o "FOWARD" anterior andaria 19cm ao invés do padrão.

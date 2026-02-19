O robô é altamente configurável pelo bluetooth tanto por um aplicativo de celular quanto por uma interface web. Futuramente vamos unificar os dois em uma coisa só.

Dentre as funcionalidades do App, está a capacidade de mandar todos os parâmetros de um "perfil de velocidade", alem das seguintes configurações:

```
fan_speed;

angular_kp; angular_ki; angular_kd;

wall_kp; wall_ki; wall_kd;

linear_vel_kp; linear_vel_ki; linear_vel_kd;

diagonal_walls_kp; diagonal_walls_ki; diagonal_walls_kd;

min_move_speed;

ir_wall_dist_ref_right; ir_wall_dist_ref_front_left; ir_wall_dist_ref_front_right; ir_wall_dist_ref_left;

ir_wall_control_th_right; ir_wall_control_th_front_left; ir_wall_control_th_front_right; ir_wall_control_th_left;

ir_wall_detect_th_right; ir_wall_detect_th_front_left; ir_wall_detect_th_front_right; ir_wall_detect_th_left;

z_imu_bias;

start_wall_break_cm_left; start_wall_break_cm_right; enable_wall_break_correction;
```

Além disso consegue coletar logs, configurar uma sequencia de movimento hardcodded para agilizar os testes e ver valores dos sensores em real time. Pela interface web conseguimos vizualizar o mapa do robô em tempo real enquanto vai mapeando o labirinto.

Todas essas funcionalidades ajudam bastante em testes, mas não são utilizadas em tomadas oficiais de tempo.

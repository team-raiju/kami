A mediçãod e velocidade linear é feita através dos encoders do robô. Essa medição acaba muitas vezes sendo ruidosa e deve ser feita com bastante cuidado para fornecer dados confiáveis.

No nosso caso, utilizamos interupções em GPIO para detectar os ticks do encoder. E vamos incrementando uma variável (left_encoder.ticks e right_encoder.ticks) a cada interrupção. Depois, separadamente, a cada 1ms, calculamos a velocidade com base no número de ticks que aconteceram desde a última medição:

```cpp
// Exemplo de processamento para a velocidade da esquerda

uint32_t delta_time_tick_left = bsp::get_tick_us() - left_encoder.last_update_tick_time;

if (delta_time_tick_left > MAX_TIME_WITHOUT_ENCODER_US) {
        left_encoder.linear_vel_m_s = 0;
} else {
    int32_t ticks = left_encoder.ticks;
     // Nenhum tick detectdado no ultimo 1 milissegundo. Então consideramos a menor velocidade. A velocidade só se torna 0 depois de MAX_TIME_WITHOUT_ENCODER_US
    if (ticks == 0) {
        ticks = left_encoder.direction == CW ? -1 : 1;
    }

    left_encoder.linear_vel_m_s = ((ticks * ENCODER_DIST_MM_PULSE) / (float)delta_vel_time) * MM_PER_US_TO_M_PER_S;
}


// Prepara variáveis para a próxima vez
left_encoder.last_update_tick_time = bsp::get_tick_us();
left_encoder.ticks = 0
```

Depois a velocidade linear é calculada com os dados da velocidade esqerda e diretia e passando um filtro de média:

```cpp
linear_velocity_m_s = (left_encoder.linear_vel_m_s + right_encoder.linear_vel_m_s) / 2.0;

filtered_velocity_m_s = linear_velocity_m_s * 0.1 + filtered_velocity_m_s * 0.9;
```

Esse `filtered_velocity_m_s` é o valor efetivamente usado no robô para tudo.

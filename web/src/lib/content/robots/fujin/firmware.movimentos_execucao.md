No código a parte de execução do movimento se encontra em `src/services/navigation.cpp` na função `Navigation::step()`

No geral todo movimento tanto de curva quando de retas, segue a lógica do gráfico abaixo:

<figure>
    <img src="/images/fujin/acc_2.png" alt="acc_2">
    <figcaption>acc_2</figcaption>
</figure>

Para um **movimento de reta** temos a max_speed e a acceleration como parâmetros (como visto no tópico anterior). O robô utiliza seu controle para tentar manter a aceleração e velocidade linear desejada. Devemos escolher acelerações e velocidades que o robô consiga atiginr físicamente, se não o controle se perde.

O tempo de aceleração é calculado de forma simples:
$$ T_{acc} = (Vel_{final} - Vel_{inicial}) / Acc  $$

Sendo $ Vel_{final} $ a "max_speed". Já para o robô saber em que momento deve começar a frear, utilizamos a informação do próximo movimento que ele vai fazer. Por exemplo, se está em uma reta e logo depois vem um "TURN_RIGHT_90", ele vê a velocidade linear que deve ter no "TURN_RIGHT_90" e utiliza Toricelli para calcular quantos centímetros antes deve iniciar a desaceleração.


$$ V_{nextmovement} ^ 2 = V_{current} ^ 2 + 2 * \Delta S_{break}  $$

Dessa forma, é possível calcular a distância necessária $ \Delta S_{break} $ para conseguir frear para ter a velocidade do próximo movimento no momento certo. Então monitorando a distância que ja percorreu $\Delta S_{percorrido}$ e a distância que deveria ser percorrida no total $\Delta S_{target}$ , sabe que deve começar a frear quando a $\Delta S_{percorrido}$ for:

$$ \Delta S_{percorrido} = \Delta S_{target} - \Delta S_{break} $$


No código temos a função `get_torricelli_distance()` que lida com isso.

------------------------------------------------------

Para **movimentos de curva**, a lógica é a mesma, só muda que ao invés de controlar a aceleração e velocidade linear, o fazemos para a velocidade angular, enquanto a velocidade linear fica constante.

Além disso, outra diferença é que nesse caso os tempos de aceleração e desaceleração, não são calculados dinamicamente, mas sim passados como parâmetros fixos (*t_start_deccel* e *t_stop* do tópico anterior). Isto porque, com testes feitos, a precisão ficou maior desse jeito.

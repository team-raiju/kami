Utilizamos um regulador chaveado integrado [TPS82130SILR](https://www.ti.com/lit/ds/symlink/tps82130.pdf?ts=1760958237714) para converter a tensão da bateria para 5 V, seguido por um regulador linear que reduz de 5 V para 3,3 V.

O regulador chaveado apresenta alta eficiência, sendo ideal em aplicações onde há uma grande diferença entre a tensão de entrada e a de saída, pois minimiza as perdas de energia.

Já o regulador linear fornece uma tensão de saída com baixo ruído e ripple, o que o torna adequado para alimentar circuitos integrados mais sensíveis, como o microcontrolador.

Sobre o TPS82130SILR, uma grande vantagem é seu tamanho e o pouco espaço que ocupa na PCB, entretanto de ponto negativo está a dificuldade de soldar e de se comprar (apesar de que é possível achar no aliexpress). Outro problema é que apesar de falar que a máxima tensão de entrada é 17V, tivemos problemas uma vez que testamos em 4S. Mas para como o fujin é 3S, isso não foi um problema.

Além disso, temos um circutio com um MOSFET-P na entrada do regulador, conectada à um switch. Seu intuito é ligar e desligar o robô apenas pelo switch, sem necessidade de remoção da bateria.

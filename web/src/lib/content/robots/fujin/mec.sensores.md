Utilizamos 4 sensores compostos por um par emissor-receptor IR ([ST-1KL3A](https://www.kodenshi.co.jp/top/wp-content/uploads/2022/03/ST-1KL3A.pdf) e 
[SFH-4550](https://br.mouser.com/ProductDetail/ams-OSRAM/SFH-4550?qs=K5ta8V%252BWhtavCsf0k%2FOizw%3D%3D&gad_campaignid=22353288137)) dois apontando para a frente levemente inclinados para fora (~5°) e outros dois apontando para os lados (entre 30° e 40°).

O posicionamento dos sensores tenta otimizar 3 coisas ao mesmo tempo:

-  **Detectar paredes na fase de mapeamento**: Essa detecção é sempre feita no ponto inicial de cada célula, dessa forma a inclinação dos sensores laterias é necessária para conseguir ver a parede um pouco antes do meio da célula.

- **Controle de Posição**: Para o robô sempre se posicionar no meio da célula durante as retas, utiliza os valores medidos pelos sensores laterais. Já para se posicionar no meio durante diagonais, utiliza os sensores frontais, para isso é importante a inclinação de 5° deles. Para conseguir detectar os postes e se posicionar adequadamente.

- **Correção de posição por "quebra de parede"**: Os sensores laterias tem outra função importante que é detectar com antecedência quebras de parede, isto é, momentos em que o robô estava vendo uma parede lateral anteriormente mas parou de ver. Com a nossa angulação é possível detectar quebras de parede aproximadamente 11cm antes. Essa informação é utilizada para corigir a posição do robô antes de cada curva

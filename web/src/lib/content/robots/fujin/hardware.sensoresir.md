Utilizamos um par emissor-receptor IR como sensor de distancia no robô. Ele é composto por um [ST-1KL3A (receptor)](https://www.kodenshi.co.jp/top/wp-content/uploads/2022/03/ST-1KL3A.pdf) e um [SFH-4550 (emissor)](https://br.mouser.com/ProductDetail/ams-OSRAM/SFH-4550?qs=K5ta8V%252BWhtavCsf0k%2FOizw%3D%3D&).

Esses são os sensores mais utilizados de micromouse em todo mundo, a grande vantagem desse par é o baixo _half-angle_ de emissão (3° para o SFH-4550 e 6° para o ST-1KL3A) e também o fato de só emitirem luz IR em uma faixa estreita de frequência.

Outra parte importante do circuito é que possuimos 4 pinos do microcontrolador para controlar individualmente cada um dos emissores através de um transistor. Isso serve para conseguir medir a quantidade de luz no receptor com os emissores ligados e depois desligados, a fim de diminuir a influência da luz do ambiente na medição. A medida final do sensor é:

$$ Valor_{receptor} = Valor_{emissor_on} - Valor_{emissor_off} $$

Além do que, fazemos a medida de cada sensor individualmente, para evitar interferências entre eles.

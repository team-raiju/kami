## Extras

<details>
<summary>Considerações sobre constantes</summary>

<span style="{ font-size: 8px; }"> _by Marco_ </span>

As constantes atualmente utilizadas são:

|                           |                |
| ------------------------- | -------------- |
| Kp                        | 600            |
| Kd                        | 4000           |
| Ki                        | 0              |
| PID_MULTIPLICATION_FACTOR | 100.0 \* 175.0 |

<br>

Essas contantantes são as mesmas tanto para as retas quanto para as curvas. Funcionaram bem em um amplo espectro de "base_speeds".

Antes de fazer um seguidor, achava que essa seria a parte mais demorada do projeto. Entretanto, acabou sendo uma parte relativamente rápida achar constantes adequadas uma vez que os cáculos estavam corretos. As partes de mapeamento, aceleração, freio, velocidade de processamento, filtro do IMU, acabaram demorando bem mais. Assim, uma dica que eu daria, seria realmente revisar que todas as contas do PID estão certinhas antes de começar a chutar constantes.

Além disso, outra dica para um chute inicial das constantes é pensar se o valor "chutado inicialmente" faz sentido. Por exemplo, no caso do Raijin, podemos ver que Kp = 600 é um valor que até que faz sentido considerando valores de erros imaginários.

Isto é, imagine qual seria o "rotation_ratio", caso alguma combinação de sensores estivesse lendo linha e utilize as suas fórmulas de PID para chegar nos valores. Primeiro fica mais fácil fazer as contas só do "KP" que faz sentido, e depois pensa no "KD". "KI geralmente não é utilizado.

Por exemplo, utilizando as contas descritas no código acima:

- Cenário 1
  KP = 600; sensores vendo = sensor mais a esquerda:

$average_{left} = (0 * 3.8 + 1000 * 3.4 + 1000 * 3.0 + 1000 * 2.6 + 1000 * 2.2 + 1000 * 1.8 + 1000 * 1.4 + 1000 * 1.0) / 8.0 = 1925$

$average_{right} = (1000 * 1.0 + 1000 * 1.4 + 1000 * 1.8 + 1000 * 2.2 + 1000 * 2.6 + 1000 * 3.0 + 1000 * 3.4 + 1000 * 3.8) / 8.0 = 2400$

$erro = (2400 - 1925) / 10.0 = 47.5$

$rotation_{ratio} = \frac{(error * kp)}{MULTIPLICATION_{FACTOR}} = \frac{600 * 47.5}{(100 * 175)}$

$rotation_{ratio} = 1.62 m/s$

Ou seja, vamos supor que a "target_speed" do robô seja 2m/s, neste caso, a velocidade de cada motor seria:

$V_{l} = 2 - 1.62 = 0.38 m/s$

$V_{r} = 2 + 1.62 = 3.62 m/s$

E a PWM seria:

$PWM_{l} = 0.38 * 131.25 = 49$

$PWM_{r} = 3.62 * 131.25 = 475$

Isso são valores que fazem sentido. Por exemplo, se as contas tivessem dado $rotation_{ratio} = 10 m/s$, saberiamos que é um valor impossível de "KP" (neste caso PWM seria 1312 que é maior que o máximo valor possível de PWM = 1000)

Além disso, é bom observar se a velocidade obtida não fica maior que o máximo que o robô consegue andar. Caso isso ocorra, o PID está saturado e a resposta não será tão boa.

- Cenário 2
  KP = 600; sensores vendo = mais ao meio da direita:

Seguindo a mesma lógica, temos:

$average_{left} = 2400$

$average_{right} = 2275$

$erro = (2275 - 2400) / 10.0 = -12.5$

$rotation_{ratio} = \frac{(error * kp)}{MULTIPLICATION_{FACTOR}} = \frac{600 * -12.5}{(100 * 175)}$

$rotation_{ratio} = 0.428 m/s$

$V_{l} = 2 - 0.428 = 1.572 m/s$

$V_{r} = 2 + 0.428 = 2.428 m/s$

$PWM_{l} = 1.572 * 131.25 = 206$

$PWM_{r} = 2.428 * 131.25 = 318$

> Como cada robô faz as contas um pouquinho diferente, revise varias vezes a escala das variáveis antes de aplicar no seu robô.

> Uma vez que achou um KP bom, o KD no nosso caso foi 1 ordem de grandeza maior, aproximadamente (considerando que KP e KD estão sendo calculados na mesma escala). Além disso, o KD, na verdade, depende do periodo de tempo do loop de controle. Acredito que se o loop de controle fosse 10ms ao invés de 1ms, o KD atual teria que ser multiplicado por 10.

</details>

<br>

<details>
<summary>FAQ</summary>
</details>

<br>

<details>
<summary>Referências e Links Úteis</summary>

- [Cálculo de posição para Differential Drive Robots I](https://www.youtube.com/watch?v=14xipN7Gx-I)
- [Cálculo de posição para Differential Drive Robots II](https://www.youtube.com/watch?v=LrsTBWf6Wsc)
- [Entrevista com o campeão do All Japan Student Micromouse Robotrace 2022 (em japonês)](https://maxonjapan.com/report/umemoto_1/)
- [Ficha técnica dos tobôs participantes do All Japan Micromouse 2023](https://www.ntf.or.jp/mouse/micromouse2023/AllJapan/recode.html)

Alguns blogs japoneses:

- [Underbird](https://underbirdworks.blogspot.com/2023/12/2023-underbird3x.html)
- [Dr. Shabutsu's Robot Workshop](http://ak-rcroom.com/sakuhin/robotracer/robotracer.html)
- [Sora](https://garberas.com/archives/2363)
- [Aniki Hirai](http://anikinonikki.cocolog-nifty.com/)
- [hayabusa0213](https://hayabusa0213.hatenablog.com/)

</details>

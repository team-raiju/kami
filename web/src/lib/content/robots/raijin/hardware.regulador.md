<figure>
    <img src="/images/raijin/supply.png" alt="Supply">
    <figcaption>Esquemático do regulador de Tensão</figcaption>
</figure>

O consumo total da placa é de aproximadamente 650mA. Sendo 400mA somente dos sensores de linha (20x QRE1113).

Dessa forma, idealmente, um regulador de tensão chaveado seria a melhor escolha. Entretanto, como havia espaço, foram utilizados reguladores lineares.

Devido à menor eficiência dos reguladores lineares, foi necessário usar dois de cada (dois de 12V, dois de 5V e dois de 3.3V). Um conjunto desses reguladores é utilizado apenas para a parte dos sensores de linha, e o outro para alimentar o restante da placa.

A placa suporta tanto 3S quanto 4S, definido por um jumper que conecta ou não o regulador de 12V.

| Tensão | P2                  | P3                        |
| ------ | ------------------- | ------------------------- |
| 3S     | VBAT ligado a VIN_1 | VIN_1 ligado em VIN_2     |
| 4S     | VBAT ligado a V_4S  | VIN_1 não ligado em VIN_2 |

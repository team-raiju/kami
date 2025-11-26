### Sensores de Linha

A placa de sensores frontal contém 16 sensores de linha (QRE1113), para evitar conectar todos diretamente ao uC e gastar muitos pinos, há um [MCP3008](https://cdn-shop.adafruit.com/datasheets/MCP3008.pdf), que é um CI que faz leituras de ADC e posteriormente possibilita a aquisição desses dados por SPI.

Um limitante desse método é a velocidade de leitura do CI. O menor tempo conseguido para a leitura dos 16 sensores foi de 300us, aproximadamente 1/3 do tempo do loop de controle.

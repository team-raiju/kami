Uma memória 24LC512 de 64Kb é utilizadas para armazenar os dados que devem permanecer salvos mesmo sem alimentação da bateria. Ela se comunica por I2C com o microcontrolador principal da placa.

No caso, os dados salvos são o labirinto e os parâmetros do robô (como constantes de PID, velocidade, aceleração, etc...).

Inicialmente, o plano era guardar os logs também, mas tivemos barreiras pela velocidade de escrita e pelo tamano do log. Idealmente desejamos guardar um log a cada 1ms (log dos parametros do robo no loop de controle)

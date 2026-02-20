A IMU utilizada é a LSM6DSRTR da STMicroelectronics. Foi escolhida por possuir um limite máximo de 4000dps (graus por segundo), além de possuir integrações prontas com bibliotecas da ST, como a MotionGC.

Em geral, IMUs possuem um limite de 2000dps (=34.9rad/s), o que pode não ser suficiente, dado que, como visto em [Parâmetros Atuais](#mec_params), o robô pode atingir velocidades maiores que esse limite. Atualmente nosso máximo é 26.18rad/s, mas é bom ter margem para aumentar.

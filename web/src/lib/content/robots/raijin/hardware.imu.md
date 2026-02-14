A IMU utilizada é a [LSM6DSRTR](https://www.st.com/resource/en/datasheet/lsm6dsr.pdf) da STMicroelectronics. Foi escolhida por possuir um limite máximo de 4000dps (graus por segundo), além de possuir integrações prontas com bibliotecas da ST, como a [MotionGC](https://www.st.com/resource/en/user_manual/um2181-getting-started-with-motiongc-gyroscope-calibration-library-in-xcubemems1-expansion-for-stm32cube-stmicroelectronics.pdf).

Em geral, IMUs possuem um limite de 2000dps, o que pode não ser suficiente, dado que:

$V_{giro} = \frac{V_l - V_r}{Distancia_{rodas}}$

Dessa forma se a velocidade for de 2m/s e distância das rodas = 12cm, temos:

$V_{giro} = \frac{2 - (-2)}{0.12} = 33.33 rad/s = 1909 dps$

Que seria muito próximo do limite teórico.

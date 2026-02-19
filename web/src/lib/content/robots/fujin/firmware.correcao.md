O robô utiliza as "quebras de parede" (wall_break no código) para realizar uma correção de posição sempre que possível em retas. Ou seja, quando estava vendo uma parede lateral com o sensor, e parou de ver (borda de descida), ele corrige sua posição. Como esse evento sempre acontece em uma posição fixa em relação ao começo da célula, é possível fazer essa correção.

<figure>
    <img src="/images/fujin/wall_break.jpeg" alt="wall_break">
    <figcaption>wall_break</figcaption>
</figure>

De acordo com a imagem acima, tendo um "D" de referência que já foi medido previamente, podemos calcular a distancia real percorrida pelo robô de acordo com o código abaixo:

```cpp
int cells_traveled = (current_traveled_dist_cm / CELL_SIZE_CM);

corrected_distance_cm = (cells_traveled * CELL_SIZE_CM) + D;
```

Então antes o robô "achava" que tinha percorrido uma distancia igual à "current_traveled_dist_cm", mas na verdade ele percorreu uma distancia "corrected_distance_cm".

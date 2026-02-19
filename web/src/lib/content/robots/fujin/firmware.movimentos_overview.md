Uma vez que o robô fez o mapeamento e possui o mapa em sua memória, ele calcula a melhor rota para o centro do labirinto e gera uma sequência de movimentos. A partir desse momento, o mapa não tem muito mais utilidade e o robô só precisa executar essa lista de movimentos. A lista de movimentos tem o seguinte formato:

```cpp
std::vector<std::pair<Movement, uint8_t>> target_movements;

target_movements = {
    {Movement::START, 1},
    {Movement::FORWARD, 2},
    {Movement::TURN_RIGHT_90, 1},
    {Movement::TURN_LEFT_45, 1},
    {Movement::DIAGONAL, 2}
    {Movement::STOP, 1}
};
```
O robô só para quando a lista acabar ou quando encontrar o movimento "STOP". O segundo item do par (por exemplo "2" em "Movement::FORWARD, 2"), significa quantas repetições do movimento ele vai fazer. Por exemplo em um movimento "FOWARD" ele andaria 18cm, então em "FOWARD, 2", ele anda 2*18 = 36cm. Essa otimização serve para otimizar a aceleração e freio do robô fazendo multiplos movimentos iguais se tornarem um só.

A lista de todos os movimentos possíveis é:

```cpp
enum Movement {
    START                       // Anda para frente 10cm para se posicionar no começo da proxima celula
    FORWARD                     // Anda para frente 18cm, tamanho de uma célula
    DIAGONAL                    // Anda para frente 12.727922cm, tamanho de uma diagonal
    TURN_RIGHT_45               // Vira 45 graus para direita
    TURN_LEFT_45                // Vira 45 graus para esquerda
    TURN_RIGHT_90               // Vira 90 graus para direita
    TURN_LEFT_90                // Vira 90 graus para esquerda
    TURN_RIGHT_135              // Vira 135 graus para direita
    TURN_LEFT_135               // Vira 135 graus para esquerda
    TURN_RIGHT_180              // Vira 180 graus para direita
    TURN_LEFT_180               // Vira 180 graus para esquerda
    TURN_RIGHT_45_FROM_45       // Vira 45 graus para direita a partir de uma diagonal
    TURN_LEFT_45_FROM_45        // Vira 45 graus para esquerda a partir de uma diagonal
    TURN_RIGHT_90_FROM_45       // Vira 90 graus para direita a partir de uma diagonal
    TURN_LEFT_90_FROM_45        // Vira 90 graus para esquerda a partir de uma diagonal
    TURN_RIGHT_135_FROM_45      // Vira 135 graus para direita a partir de uma diagonal
    TURN_LEFT_135_FROM_45       // Vira 135 graus para esquerda a partir de uma diagonal
    TURN_AROUND                 // Vira 180 graus no próprio eixo, e volta para o começo da célula
    TURN_RIGHT_90_SEARCH_MODE   // Vira 90 graus para direita, mas garantindo que o movimento acaba exatamente no começo da próxima célula
    TURN_LEFT_90_SEARCH_MODE    // Vira 90 graus para esquerda, mas garantindo que o movimento acaba exatamente no começo da próxima célula
    TURN_AROUND_INPLACE         // Vira 180 graus no próprio eixo
    STOP                        // Anda para frente 10cm e para
};
```


Em um primeiro modo de operação, o robô gera apenas, a partir do mapa, uma lista de movimento sem diagonais, convertendo múltiplos movimentos iguais em um movimento contínuo, e convertendo dois TURN_RIGHT_90 seguidos em um TURN_RIGHT_180, e dois TURN_LEFT_90 em um TURN_LEFT_180. Esse tipo de conversão chamamos de `get_smooth_movements` no código. A sequência de conversões em alto nível é mais ou menos assim:

```
maze = read_maze_from_memory() ->
target_directions = directions_to_goal(maze) ->
movements = get_target_movements(target_directions) ->
smooth_moves = get_smooth_movements(movements).
```

Já, para a geração de movimentos com diagonais, temos a função `get_diagonal_movements()` no código. Ele funciona através de uma máquina de estados que tem como saída essa lista de movimentos. Mais detalhes podem ser vistos diretamente em nosso código do github e a teoria em https://micromouseonline.com/2014/05/05/diagonal-paths-micromouse-using-state-machine/

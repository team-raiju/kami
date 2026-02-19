Para a busca do melhor caminho da origem para o objetivo, utilizamos o algoritmo de flood fill. Para a organização do labirinto no código, temos as seguintes structs:

```cpp
struct Cell {
    uint8_t distance;
    uint8_t walls;
    uint8_t known_walls;

    bool visited() { return known_walls == 0b1111; }

    Cell* north;
    Cell* east;
    Cell* south;
    Cell* west;

    ///...
}

static constexpr Direction Directions[] = {
    Direction::NORTH,
    Direction::WEST,
    Direction::SOUTH,
    Direction::EAST,
};

enum Walls : uint8_t {
    N = 1 << Direction::NORTH,
    W = 1 << Direction::WEST,
    E = 1 << Direction::EAST,
    S = 1 << Direction::SOUTH,
};

/// @brief This is a circular 4 bit shift to be used with Directions
static constexpr uint8_t operator<<(uint8_t x, const Direction n) {
    const uint8_t _n = std::to_underlying(n);
    return 0xF & ((x << _n) | (x >> (4 - _n)));
}
```
O labirinto é um vetor de 16x16 dessas células. O robô vai preenchendo cada uma dessas células de acordo com sua posição atual. O processo é assim:
1. O robô sempre começa o algoritmo no ponto (0, 0) apontando para a direção "NORTH" e se move meia célula para frente para iniciar a amostragem do ponto (0, 1)
2. No início da próxima célula (bem onde os postes estão posicionados), o robô faz amostragem das paredes dessa célula e atualiza o campo "walls" da struct de acordo com a direção que está apontando no momento `uint8_t walls =
            (sensingStatus.front_seeing * N | sensingStatus.right_seeing * E | sensingStatus.left_seeing * W)
            << robot_dir;`
3. Com base nessa nova informação, decide qual seu próximo movimento dentre 3 possíveis: "LEFT 90", "RIGHT 90", "TURN_AROUND" ou "FOWARD". Para essa decisão, roda o algoritmo de floodfill para ir em direção ao objetivo do labirinto
4. Efetivamente realiza o movimento desejado. Para isso, entra o loop de controle, que controla a velocidade angular e linear para realizar o movimento desejado (por exemplo virar 90 graus). Todo movimento é calibrado para acabar bem no início da próxima célula. Mas detalhes sobre como o movimento é executado em [Movimentos](#movimentos)
5. Depois de terminar o movimento, atualiza a sua posição e a nova direção que está apontando.  Por exemplo se o movimento foi virar para a direita 90 graus, e antes estava apontando para o "NORTH" na posição (0,1), agora vai estar apontando para o "EAST" e estará na posição (1,1)
6. Volta o algoritmo paa o item "2." e repete até a posição do robô ser igual a posição desejada

O algoritmo de flood fill utilizado, não foge do padrão, e varios materiais de referência podem ser encontrados na internet. Também esta disponível no nosso código no arquivo "flood_fill.hpp".

Uma das grandes dificuldades do search é garantir que as amostragem de paredes, sempre serão realizadas no mesmo ponto. Isto é, no início da celula (na direção vertical) e bem no meio na (posição horizontal). Porque caso a posição de amostragem mude, o valor dos sensores pode mudar de tal forma a ter falsos positivos ou negativos na leitura da parede. Para isso a calibração do movimento deve estar bem boa. Além disos a leitura dos sensores deve ser estável e não muito influenciada por fatores externos.

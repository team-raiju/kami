Para executar cada um dos movimentos descritos acima, o robô fica em um loop que roda a cada 1ms, até o movimento acabar. No código os parametros de movimento são divididos em duas grandes estruturas: "foward params" e "turn params", isto é, movimentos em que o robô está andando reto e movimentos em que está fazendo curva.

Cada um desses tipos de movimentos possuem uma estrutura no código para serem representados:

```cpp
/**
 * @struct TurnParams
 * @brief Parameters for defining a turn movement.
 *
 *
 * @param start Where the movement begins in relation to the start of the cell [cm] (can be negative (before the cell
 * begin) or positive (after the cell begin))
 * @param end Where the movement ends in relation to the start of the cell [cm] (can be negative (before the cell begin)
 * or positive (after the cell begin))
 * @param turn_linear_speed The linear speed during the turn in [m/s]
 * @param angular_accel The angular acceleration during the turn in [rad/s^2]
 * @param max_angular_speed The maximum angular speed during the turn in [rad/s]
 * @param angle_to_turn The angle to turn in [rad]. Only used on search mode
 * @param t_start_deccel The time elapsed when deceleration is going to start [ms]
 * @param t_stop The time elapsed when curve is going to stop [ms]
 * @param sign The direction sign of the turn (positive = LEFT or negative = RIGHT).
 *
 */
struct TurnParams {
    float start;
    float end;
    float turn_linear_speed;
    float angular_accel;
    float max_angular_speed;
    float angle_to_turn;
    uint16_t t_start_deccel;
    uint16_t t_stop;
    int sign;
};

/**
 * @struct ForwardParams
 * @brief Parameters for defining a forward movement.
 *
 *
 * @param max_speed The maximum speed of the robot in [m/s]
 * @param acceleration The acceleration of the robot in [m/s^2]
 * @param deceleration The deceleration of the robot in [m/s^2]
 * @param target_travel_cm The distance the robot should travel in [cm]
 */
struct ForwardParams {
    float max_speed;
    float acceleration;
    float deceleration;
    float target_travel_cm;
};

```

Um movimento pode conter essas duas estruturas de parâmetros. Por exemplo um "LEFT_90", pode primeiro ter que andar 1cm, para só então começar a girar. Esse 1cm inicial seria controlado pelas variáveis de "foward params" e a curva pelos "turn params".


Apenas preenchendo-se essas estruturas para cada um dos tipos de movimento, o código ja consegue executar o moviemnto. A grande vantagem é que fica relativamente simples testar novas velocidades para cada um dos movimentos. Um "perfil" de velocidade como FAST, MEDIUM, ou SLOW, nada mais é que o conjunto de parâmetros dessa struct. Por exemplo, aqui o "FAST":

```cpp
std::map<Movement, TurnParams> turn_params_fast = {
    {Movement::TURN_RIGHT_45, {-6.4, -8.2, 1.5, 785.40, 20.07, 0.7854, 38, 73, -1}},
    {Movement::TURN_LEFT_45, {-6.4, -8.2, 1.5, 785.40, 20.07, 0.7854, 38, 73, 1}},
    {Movement::TURN_RIGHT_90, {0.0, -1.1, 1.3, 785.40, 26.18, 1.5708, 60, 108, -1}},
    {Movement::TURN_LEFT_90, {0.0, -1.25, 1.3, 785.40, 26.18, 1.5708, 60, 108, 1}},
    {Movement::TURN_RIGHT_135, {-4.6, -4.6, 1.5, 436.33, 20.07, 2.3562, 116, 167, -1}},
    {Movement::TURN_LEFT_135, {-4.6, -5.0, 1.5, 436.33, 20.07, 2.3562, 116, 167, 1}},
    {Movement::TURN_RIGHT_180, {-1.0, -1.1, 1.3, 523.6, 14.25, 3.1416, 217, 242, -1}},
    {Movement::TURN_LEFT_180, {-1.0, -1.7, 1.3, 523.6, 14.25, 3.1416, 217, 242, 1}},

    {Movement::TURN_RIGHT_45_FROM_45, {0.0, 5.7, 1.5, 785.40, 20.07, 0.7854, 38, 73, -1}},
    {Movement::TURN_LEFT_45_FROM_45, {0.0, 5.4, 1.5, 785.40, 20.07, 0.7854, 38, 73, 1}},
    {Movement::TURN_RIGHT_90_FROM_45, {0.0, -2.6, 1.5, 785.40, 26.18, 1.5708, 60, 108, -1}},
    {Movement::TURN_LEFT_90_FROM_45, {0.0, -3.3, 1.5, 785.40, 26.18, 1.5708, 60, 108, 1}},
    {Movement::TURN_RIGHT_135_FROM_45, {0.0, 3.8, 1.5, 436.33, 20.07, 2.3562, 116, 167, -1}},
    {Movement::TURN_LEFT_135_FROM_45, {0.0, 3.9, 1.5, 436.33, 20.07, 2.3562, 116, 167, 1}},

    {Movement::TURN_AROUND, {0.0, 0.0, 1.5, 52.36, 3.49, 3.1416, 0, 0, -1}},
};

std::map<Movement, ForwardParams> forward_params_fast = {
    {Movement::START, {1.5, 12.0, 20.0, HALF_CELL_SIZE_CM + ROBOT_DIST_FROM_CENTER_START_CM_FAST}},
    {Movement::FORWARD, {4.5, 25.0, 30.0, CELL_SIZE_CM}},
    {Movement::DIAGONAL, {3.5, 15.0, 25.0, CELL_DIAGONAL_SIZE_CM}},
    {Movement::STOP, {1.0, 2.0, 30.0, (HALF_CELL_SIZE_CM - 1.0)}},
    {Movement::TURN_AROUND, {1.5, 12.0, 20.0, 7.9}},

    {Movement::TURN_RIGHT_90, {1.3, 12.0, 20.0, 0.5}},
    {Movement::TURN_LEFT_90, {1.3, 12.0, 20.0, 0.5}},
    {Movement::TURN_RIGHT_180, {1.3, 12.0, 20.0, -0.7}},
    {Movement::TURN_LEFT_180, {1.3, 12.0, 20.0, -0.7}},

    {Movement::TURN_RIGHT_45_FROM_45, {1.5, 12.0, 20.0, 6.75}},
    {Movement::TURN_LEFT_45_FROM_45, {1.5, 12.0, 20.0, 6.3}},
    {Movement::TURN_RIGHT_90_FROM_45, {1.5, 12.0, 20.0, 3.3}},
    {Movement::TURN_LEFT_90_FROM_45, {1.5, 12.0, 20.0, 3.2}},
    {Movement::TURN_RIGHT_135_FROM_45, {1.5, 12.0, 20.0, 2.75}},
    {Movement::TURN_LEFT_135_FROM_45, {1.5, 12.0, 20.0, 2.8}},
};

```

Para facilitar ainda mais nossos testes, conseguimos editar cada um desses parâmetros via bluetooth em um app de celular, agilizando bastante os testes.

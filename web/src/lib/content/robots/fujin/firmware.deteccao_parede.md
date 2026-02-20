Para a detecção de parede no inicio da célula, comparamos a leitura dos 4 sensores com valores de referência que foram medidos préviamente para cada combinação de parede. Para a configuração que tiver o menor erro, consideramos que é a leitura de parede correta:

```cpp
/// @brief Sensor raw values in every wall combination
constexpr std::array<SensingPattern, 8> ir_wall_patterns = {{
    {1119, 850, 1290, 1460}, // F-L-R
    {960, 820, 1200, 880},   // F-L
    {500, 700, 1160, 1460},  // F-R
    {520, 755, 1200, 870},   // F
    {900, 67, 246, 1460},    // L-R
    {900, 28, 230, 870},     // L
    {530, 35, 261, 1300},    // R
    {180, 66, 238, 800}      // None
}};

SensingStatus ir_get_sensing_status() {
    SensingPattern current_pattern;
    current_pattern.FL = ir_reading(FRONT_LEFT);
    current_pattern.FR = ir_reading(FRONT_RIGHT);
    current_pattern.L = ir_reading(LEFT);
    current_pattern.R = ir_reading(RIGHT);

    // Compares the current value to all references and find the closest match
    uint32_t min_diff = 10000;
    uint8_t pattern_idx = 0;
    for (uint8_t i = 0; i < ir_wall_patterns.size(); i++) {
        uint32_t diff = std::abs((int32_t)current_pattern.FL - (int32_t)ir_wall_patterns[i].FL) +
                        std::abs((int32_t)current_pattern.FR - (int32_t)ir_wall_patterns[i].FR) +
                        std::abs((int32_t)current_pattern.L - (int32_t)ir_wall_patterns[i].L) +
                        std::abs((int32_t)current_pattern.R - (int32_t)ir_wall_patterns[i].R);
        if (diff < min_diff) {
            min_diff = diff;
            pattern_idx = i;
        }
    }

    // ... continua e de acordo com o pattern_idx decide quais paredes foram detectadas
}

```
Para preencher a array `ir_wall_patterns`, utilizamos o modo de calibração descrito em [Visão Geral](#firmware) no modo "Sensors Calib"

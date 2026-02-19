Como dito anterioremente, precisamos garantir uma leitura estável dos sensores IR. Tanto para a correta identificação das paredes, quanto para o controle de posição do robô.

Para isso, nossa estratégia foi:
- Leitura por DMA para não atrapalhar o código principal
- Cada leitura é uma média móvel de 20 leituras anteriores
- Garantir um posicionamento fixo e constante de cada sensor
- Uma proteção de impressão 3D para o emissor e receptor, a fim de evitar "vazamento" de luz para o sensor adjacente
- Fazer a leitura recebida pelo receptor com o emissor desligado e depois com ele ligado, a fim de extrair o ruído do ambiente

Dito tudo isso, o código dessa parte é o seguinte:

```cpp
void adc1_callback(uint32_t* data) {
    static bool read_ir_off = true;
    uint32_t aux_readings[ADC_1_DMA_CHANNELS] = {0};

    if (read_ir_off) {
        bsp::leds::ir_emitter_all_on();
    } else {
        bsp::leds::ir_emitter_all_off();
    }

    for (uint16_t i = 0; i < (ADC_1_DMA_HALF_BUFFER_SIZE - 1); i += ADC_1_DMA_CHANNELS) {
        for (uint16_t j = 0; j < ADC_1_DMA_CHANNELS; j++) {
            aux_readings[j] += data[i + j];
        }
    }

    for (uint16_t j = 0; j < ADC_1_DMA_CHANNELS; j++) {
        aux_readings[j] /= (ADC_1_DMA_HALF_BUFFER_SIZE / ADC_1_DMA_CHANNELS);
    }

    for (int i = 0; i < 4; i++) {
        if (read_ir_off) {
            ir_readings_off[i] = aux_readings[i];
        } else {
            ir_readings_on[i] = aux_readings[i];
            uint32_t reading = std::max(ir_readings_on[i] - ir_readings_off[i], 0L);
            ir_readings[i] = moving_average(ir_window[i], IR_AVG_WINDOW, &window_idx[i], reading);
        }

    }

    read_ir_off = !read_ir_off;
    battery_reading = 0.5 * aux_readings[4] + battery_reading * 0.5;
}

void adc2_callback(uint32_t* data) {
    uint32_t aux_readings[ADC_2_DMA_CHANNELS] = {0};

    for (uint16_t i = 0; i < (ADC_2_DMA_HALF_BUFFER_SIZE - 1); i += ADC_2_DMA_CHANNELS) {
        for (uint16_t j = 0; j < ADC_2_DMA_CHANNELS; j++) {
            aux_readings[j] += data[i + j];
        }
    }

    for (uint16_t j = 0; j < ADC_2_DMA_CHANNELS; j++) {
        aux_readings[j] /= (ADC_2_DMA_HALF_BUFFER_SIZE / ADC_2_DMA_CHANNELS);
    }

    current_reading[0] = aux_readings[0];
    current_reading[1] = aux_readings[1];
}
```

Esse adc1 e adc2_callback é chamado automaticamente como uma interrupção quando o DMA completa o buffer de leitura do ADC. Assim para o código que consome esses dados, ele só precisa se preocupar em ler o valor de `ir_readings[i]`. Com isso temos medidas dos sensores bem estáveis.

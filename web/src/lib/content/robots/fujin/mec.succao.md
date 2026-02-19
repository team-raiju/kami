Para obter máxima aderência, usamos sistema de sucção que aumenta a normal do robô. Uma ventoinha cria uma àrea de baixa pressão debaixo do chassi, fazendo com que ele seja pressionado contra a pista por conta da difereça de pressão. Essa força extra garante que os pneus tenham tração máxima para acelerações e que faça curvas muito mais rápidas sem derrapar. É um sistema barato de se implementar e usado por todos os micromouses de alto nível.

<figure>
    <img src="/images/fujin/succao.jpg" alt="succao">
    <figcaption>succao</figcaption>
</figure>

O sistema consiste em um motor coreless 8523, ligado à uma ventoinha impressa em 3D e uma saia (_skirt_).

A fórmula geral para a downforce gerada é:
$$ F = \Delta P *A $$

Onde $F$ é o downforce, $\Delta P$ é a diferença de pressão (vácuo) criada pela turbina, e $A$ é a área selada pela saia. Para maximizar o downforce $F$, temos três estratégias principais:

- **Aumentar a Rotação da Turbina** (Otimizando $\Delta P$):
A diferença de pressão ($\Delta P$) não aumenta linearmente com a rotação da turbina, mas sim com o quadrado dela ($\Delta P \propto RPM^2$). Dobrar a velocidade da turbina irá, teoricamente, quadruplicar a pressão gerada e, consequentemente, quadruplicar o downforce. O problema é que a potência exigida do motor para cada aumento também aumenta considerávelmente, fazendo com que o motor esquente bastante.

- **Maximizar a Área da Saia** (Otimizando $A$):
A relação entre a área selada e o downforce é direta e linear. Se você conseguir duplicar a área da cavidade de baixa pressão (o tamanho da base delimitada pela saia), você irá duplicar o downforce gerado, mesmo que a pressão ($\Delta P$) se mantenha a mesma.

- **Garantir a Vedação Perfeita** (O Fator Crítico):
Os dois pontos anteriores são inúteis se a cavidade não estiver bem vedada. O ideal é que a saia flexível toque o chão de forma contínua, impedindo que o ar externo (de alta pressão) vaze para dentro da zona de vácuo. Qualquer vazamento reduz o $\Delta P$ que a turbina consegue sustentar, "matando" a eficiência do sistema. Uma vedação perfeita é o que permite que a turbina gere e mantenha o vácuo máximo.

Abaixo foto da nossa ventoinha que possui 29mm de diâmetro:

<figure>
    <img src="/images/fujin/ventoinha.jpeg" alt="ventoinha">
    <figcaption>ventoinha</figcaption>
</figure>

E aqui nossa "saia". É feita com um plástico relativamente flexível de saquinho plastíco, e é colado na PCB com fita dupla-face e depois selado por cima com fita-adesiva normal de empacotamento. A dureza do plástico deve ser testada empiricamente. A saia tem 1cm de largura em cada direção.

<figure>
    <img src="/images/fujin/fujin_photo_3.jpg" alt="fujin_photo_3">
    <figcaption>fujin_photo_3</figcaption>
</figure>

Por último o furo na PCB tem 15mm de diâmetro

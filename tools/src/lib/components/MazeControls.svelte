<script lang="ts">
  import { maze } from "$lib/mazeStore.svelte";
  import { mazeStateToString, stringToMazeState } from "$lib/mazeUtils";

  let fileInput: HTMLInputElement; // Variável para vincular nosso input de arquivo

  function handleExport() {
    const mazeString = mazeStateToString(maze.value);
    navigator.clipboard.writeText(mazeString).then(() => {
      alert("Labirinto copiado para a área de transferência!");
    });
  }

  // Esta função é chamada pelo botão visível para ativar o seletor de arquivos.
  function triggerFileInput() {
    fileInput.click();
  }

  // Esta função é chamada quando o usuário seleciona um arquivo no seletor.
  function handleFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    // Define o que fazer quando o arquivo for lido
    reader.onload = (event) => {
      const mazeString = event.target?.result as string;
      if (mazeString) {
        try {
          const newState = stringToMazeState(mazeString);
          if (newState.horizontalWalls.length !== 17 || newState.verticalWalls.length !== 16) {
            throw new Error("Dimensões do labirinto inválidas.");
          }
          maze.set(newState);
        } catch (error) {
          console.error(error);
          alert("Erro ao importar o labirinto. O arquivo pode estar corrompido ou em um formato inválido.");
        }
      }
    };

    // Inicia a leitura do arquivo como texto
    reader.readAsText(file);

    // Limpa o valor para permitir que o mesmo arquivo seja selecionado novamente
    input.value = "";
  }
</script>

<div class="flex w-full grow flex-col border border-gray-500/25 font-mono text-amber-500">
  <div class="flex flex-row items-center bg-amber-500/10">
    <span class="inline-block bg-amber-500 px-2 py-1 text-xs font-bold text-black uppercase">Controls</span>
    <button class="ml-auto icon-[material-symbols--bluetooth] cursor-pointer align-middle" title="Bluetooth"> </button>
    <button class="mr-1 ml-2 icon-[material-symbols--usb] cursor-pointer align-middle" title="USB Serial"> </button>
  </div>
  <div class="mt-auto grid grid-cols-2 gap-2 p-2">
    <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Maze</div>
    <button
      on:click={handleExport}
      class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
    >
      Export
    </button>
    <button
      on:click={triggerFileInput}
      class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
    >
      Import
    </button>
    <input type="file" class="hidden" accept=".txt,.mms" bind:this={fileInput} on:change={handleFileSelected} />
  </div>
</div>

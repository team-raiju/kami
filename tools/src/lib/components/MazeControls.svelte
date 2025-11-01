<script lang="ts">
  import { log } from "$lib/logsState.svelte";
  import { maze } from "$lib/mazeState.svelte";
  import { robotLog, type RobotLogRecord } from "$lib/robotLogState.svelte";
  import { mazeStateToString, stringToMazeState } from "$lib/mazeUtils";

  async function handleMazeExport() {
    const mazeString = mazeStateToString(maze.state);
    await navigator.clipboard.writeText(mazeString);
  }

  async function handleMazeRead() {
    log.error("USB/BT NYI");
  }

  async function handleMazeImport() {
    try {
      const [handle] = await window.showOpenFilePicker({
        excludeAcceptAllOption: true,
        types: [
          {
            accept: {
              "text/plain": [".txt", ".mms"],
            },
            description: "MMS Maze File",
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const mazeString = await file.text();

      if (!mazeString) {
        log.error("Failed to read maze");
        return;
      }

      const newState = stringToMazeState(mazeString);
      maze.set(newState);
      log.info("Maze imported succesfully");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        log.error("Failed to open or parse maze file");
        console.error(err);
      }
    }
  }

  async function handleLogRead() {
    log.error("USB/BT NYI");
  }

  async function handleLogImport() {
    const expectedHeader = "t;Vel;TgtVel;AngVel;TgtAngVel;PWM_L;PWM_R;Batt_mV;PosX;PosY;Angle;Dist";

    try {
      const [fileHandle] = await window.showOpenFilePicker({
        excludeAcceptAllOption: true,
        types: [
          {
            accept: {
              "text/csv": [".csv", ".txt"],
            },
            description: "Fujin Log File",
          },
        ],
        multiple: false,
      });
      const file = await fileHandle.getFile();
      const content = await file.text();

      const lines = content.trim().split(/[\r\n]/);

      const parsedRecords: RobotLogRecord[] = lines.map((line, index) => {
        const values = line.split(";");
        const parsed = values.map(parseFloat);

        if (values.length !== 12 || parsed.some((n) => isNaN(n))) {
          throw new Error(`Failed to parse CSV at line ${index + 1}`);
        }

        const [t, Vel, TgtVel, AngVel, TgtAngVel, PWM_L, PWM_R, Batt_mV, PosX, PosY, Angle, Dist] = parsed;
        return { t, Vel, TgtVel, AngVel, TgtAngVel, PWM_L, PWM_R, Batt_mV, PosX: PosX * 10, PosY: PosY * 10, Angle, Dist };
      });

      robotLog.load(parsedRecords);
      robotLog.rotatePathCounterClockwise();
      log.info("Log imported succesfully");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        log.error("Failed to open maze file");
        console.error(err);
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        maze.forward();
        break;
      case "ArrowDown":
        event.preventDefault();
        maze.turn(180);
        break;
      case "ArrowLeft":
        event.preventDefault();
        maze.turn(-90);
        break;
      case "ArrowRight":
        event.preventDefault();
        maze.turn(90);
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex w-full grow flex-col border border-gray-500/25 font-mono text-amber-500">
  <div class="flex flex-row items-center bg-amber-500/10">
    <span class="inline-block bg-amber-500 px-2 py-1 text-xs font-bold text-black uppercase">Controls</span>
    <button class="ml-auto icon-[material-symbols--bluetooth] cursor-pointer align-middle" title="Bluetooth"> </button>
    <button class="mr-1 ml-2 icon-[material-symbols--usb] cursor-pointer align-middle" title="USB Serial"> </button>
  </div>
  <!-- <div class="p-2 text-center text-sm text-amber-500/80">Use arrow keys to control the robot</div> -->
  <div class="flex flex-row gap-2 px-2 py-1">
    <input
      type="checkbox"
      id="lock-maze"
      bind:checked={maze.state.editLocked}
      class="h-4 w-4 cursor-pointer appearance-none rounded-sm border-2 border-amber-500/40 bg-transparent
    transition-colors checked:border-transparent checked:bg-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
    focus:ring-offset-black focus:outline-none"
    />
    <label for="lock-maze" class="cursor-pointer text-sm select-none">Lock Maze</label>
  </div>
  <!-- <div class="w-full border-t border-amber-500/20"></div> -->
  <div class="mt-auto grid grid-cols-2 gap-2 p-2">
    <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Robot Logs</div>
    <button onclick={handleLogRead} class="w-full cursor-not-allowed bg-amber-500/7 px-2 py-1 text-center text-amber-500 uppercase" disabled>
      Read
    </button>
    <button
      onclick={handleLogImport}
      class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
    >
      Import
    </button>
  </div>
  <div class="mt grid grid-cols-3 gap-2 p-2">
    <div class="col-span-3 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Maze</div>
    <button onclick={handleMazeRead} class="w-full cursor-not-allowed bg-amber-500/7 px-2 py-1 text-center text-amber-500 uppercase" disabled>
      Read
    </button>
    <button
      onclick={handleMazeExport}
      class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
    >
      Export
    </button>
    <button
      onclick={handleMazeImport}
      class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
    >
      Import
    </button>
  </div>
</div>

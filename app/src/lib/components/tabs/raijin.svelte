<script lang="ts">
  import { tap, press } from "svelte-gestures";
  import { CaretDown, DownloadSimple, PaperPlaneRight, RadioButton, Stop, type IconComponentProps } from "phosphor-svelte";
  import { Accordion, Label, Meter, Tabs, useId } from "bits-ui";
  import { type Component } from "svelte";
  import { logDebug } from "$lib/log.svelte";
  import { createCommandPacket, createUpdateParameterPacket, PacketCommand } from "$lib/config/raijin.svelte";
  import { bluetoothService } from "$lib/bt.svelte";

  async function handleB1Tap() {
    logDebug("Tap B1");
    const packet = createCommandPacket(PacketCommand.Button1Short);
    await bluetoothService.send(packet);
  }

  async function handleB1Press() {
    logDebug("Press B1");
    const packet = createCommandPacket(PacketCommand.Button1Long);
    await bluetoothService.send(packet);
  }

  async function handleB2Tap() {
    logDebug("Tap B2");
    const packet = createCommandPacket(PacketCommand.Button2Short);
    await bluetoothService.send(packet);
  }

  async function handleB2Press() {
    logDebug("Press B2");
    const packet = createCommandPacket(PacketCommand.Button2Long);
    await bluetoothService.send(packet);
  }

  async function handleStopTap() {
    logDebug("Tap Stop");
    const packet = createCommandPacket(PacketCommand.Stop);
    await bluetoothService.send(packet);
  }

  function handleReadTap() {
    logDebug("Tap Read");
  }

  async function sendParameter(param: keyof typeof parameters) {
    const { code, input } = parameters[param];
    const packet = createUpdateParameterPacket(code, input);
    await bluetoothService.send(packet);
  }

  // Code is the index in raijin's code
  const parameters = $state({
    enabled_line_sensors: { label: "Enabled Line Sensors", code: 0x00, input: 0, value: 0 },
    enabled_side_sensors: { label: "Enabled Side Sensors", code: 0x01, input: 0, value: 0 },
    base_speed: { label: "Base Speed", code: 0x02, input: 0, value: 0 },
    kp: { label: "KP", code: 0x03, input: 0, value: 0 },
    kd: { label: "KD", code: 0x04, input: 0, value: 0 },
    ki: { label: "KI", code: 0x05, input: 0, value: 0 },
    look_ahead_dist_mm: { label: "Look Ahead Dist (mm)", code: 0x06, input: 0, value: 0 },
    max_waypoints_ahead: { label: "Max Waypoints Ahead", code: 0x07, input: 0, value: 0 },
    front_vector_dist_mm: { label: "Front Vector Dist (mm)", code: 0x08, input: 0, value: 0 },
    w_kp: { label: "Waypoint KP", code: 0x09, input: 0, value: 0 },
    w_ki: { label: "Waypoint KI", code: 0x0a, input: 0, value: 0 },
    w_kd: { label: "Waypoint KD", code: 0x0b, input: 0, value: 0 },
    vel_control_enabled: { label: "Velocity Control Enabled", code: 0x0c, input: 0, value: 0 },
    vel_kp: { label: "Velocity KP", code: 0x0d, input: 0, value: 0 },
    vel_ki: { label: "Velocity KI", code: 0x0e, input: 0, value: 0 },
    vel_kd: { label: "Velocity KD", code: 0x0f, input: 0, value: 0 },
    fan_speed: { label: "Fan Speed", code: 0x10, input: 0, value: 0 },
    fan_straight_speed: { label: "Fan Straight Speed", code: 0x11, input: 0, value: 0 },
    marker_detect_dist_mm: { label: "Marker Detect Distance (mm)", code: 0x12, input: 0, value: 0 },
    min_left_markers: { label: "Min Left Markers", code: 0x13, input: 0, value: 0 },
    max_speed: { label: "Min Speed", code: 0x14, input: 0, value: 0 },
    min_speed: { label: "Max Speed", code: 0x15, input: 0, value: 0 },
    break_before_turn: { label: "Break Before Turn", code: 0x16, input: 0, value: 0 },
    max_acc: { label: "Max Acceleration", code: 0x17, input: 0, value: 0 },
    max_break: { label: "Max Break", code: 0x18, input: 0, value: 0 },
    white_threshold: { label: "White Threshold", code: 0x19, input: 0, value: 0 },
    time_to_complete: { label: "Time to Complete", code: 0x1a, input: 0, value: 0 },
    z_imu_bias: { label: "Z IMU Bias", code: 0, input: 0x1b, value: 0 },
    fix_position_ratio: { label: "Fix Position Ratio", code: 0x1c, input: 0, value: 0 },
    fix_angle_ratio: { label: "Fix Angle Ratio", code: 0x1d, input: 0, value: 0 },
    max_angular_accel: { label: "Max Angular Acceleration", code: 0x1e, input: 0, value: 0 },
  });

  const parameterGroups: {
    name: string;
    items: (keyof typeof parameters)[];
  }[] = [
    {
      name: "Speeds",
      items: ["base_speed", "fan_speed", "fan_straight_speed", "min_speed", "max_speed", "max_acc", "max_break", "max_angular_accel"],
    },
    {
      name: "Constrol Constants",
      items: [
        "kp",
        "ki",
        "kd",
        "w_kp",
        "w_ki",
        "w_kd",
        "vel_kp",
        "vel_ki",
        "vel_kd",
        "look_ahead_dist_mm",
        "max_waypoints_ahead",
        "front_vector_dist_mm",
        "vel_control_enabled",
      ],
    },
    {
      name: "Other Config",
      items: ["marker_detect_dist_mm", "min_left_markers", "break_before_turn", "z_imu_bias", "fix_position_ratio", "fix_angle_ratio"],
    },
    {
      name: "Sensors",
      items: ["enabled_line_sensors", "enabled_side_sensors", "white_threshold"],
    },
  ];

  // Battery
  let value = $state(4);
  const labelId = useId();

  const max = 4.35;
  const min = 3.6;

  const percentageRemaining = $derived(((value - min) / (max - min)) * 100);

  const color = $derived.by(() => {
    if (percentageRemaining < 15) return "bg-red-500";
    if (percentageRemaining < 35) return "bg-orange-500";
    if (percentageRemaining < 50) return "bg-yellow-500";
    return "bg-green-500";
  });
</script>

{#snippet LongPressButton(title: string, color: string, onTap: () => void, onPress: () => void, Icon: Component<IconComponentProps, {}, "">)}
  <button
    use:tap={() => ({ timeframe: 300 })}
    ontap={onTap}
    use:press={() => ({ timeframe: 400 })}
    onpress={onPress}
    class={`flex h-10 cursor-pointer !select-none flex-row items-center gap-1 rounded-md p-2 text-sm font-bold text-white active:scale-[0.98] active:transition-all ${color}`}
  >
    <Icon weight="fill" />
    <span> {title} </span>
  </button>
{/snippet}

{#snippet ParamInput(id: keyof typeof parameters)}
  {@const param = parameters[id]}
  <Label.Root id={id + "-label"} for={id} class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {param.label}
  </Label.Root>
  <div class="mb-3 flex h-8 w-full flex-row items-center gap-2">
    <input
      class="h-8 flex-grow rounded-md border border-violet-500 px-3 focus:border-violet-600"
      type="number"
      placeholder={id}
      {id}
      bind:value={param.input}
    />
    <div class="w-[30%] text-center">{param.value ?? "?"}</div>
    <button onclick={() => sendParameter(id)}><PaperPlaneRight /></button>
  </div>
{/snippet}

<div class="flex min-h-full select-none flex-col gap-5 px-5 pt-3">
  <div class="flex flex-row items-center justify-around">
    <div class="flex w-[60%] flex-col gap-2 text-sm text-gray-800">
      <div class="flex items-center justify-between text-sm font-medium">
        <span id={labelId}> Battery </span>
        <span>{value}</span>
      </div>
      <Meter.Root
        aria-labelledby={labelId}
        aria-valuetext="{value} out of {max}"
        value={percentageRemaining}
        min={0}
        max={100}
        class="shadow-mini-inset relative h-[15px] overflow-hidden rounded-full bg-gray-300"
      >
        <div
          class="shadow-mini-inset h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out {color}"
          style="transform: translateX(-{100 - percentageRemaining}%)"
        ></div>
      </Meter.Root>
    </div>
    <div class="flex flex-col rounded-md bg-gray-600 p-2 text-white">
      <span class="text-lg font-bold">
        {parameters["time_to_complete"].value.toString().padStart(5, "0")}
      </span>
      <span class="-mb-2 text-center text-[0.5rem]"> Lap Time </span>
    </div>
  </div>

  <div class="flex flex-row justify-center gap-2">
    {@render LongPressButton("Button 1", "bg-violet-800", handleB1Tap, handleB1Press, RadioButton)}
    {@render LongPressButton("Button 2", "bg-violet-800", handleB2Tap, handleB2Press, RadioButton)}
    {@render LongPressButton("Read", "bg-green-800", handleReadTap, () => {}, DownloadSimple)}
    {@render LongPressButton("Stop", "bg-red-800", handleStopTap, () => {}, Stop)}
  </div>

  <Accordion.Root class="w-full" type="multiple">
    {#each parameterGroups as group (group.name)}
      <Accordion.Item value={group.name} class="border-dark-10 group border-b px-1.5">
        <Accordion.Header>
          <Accordion.Trigger
            class="flex w-full flex-1 select-none items-center justify-between py-5 text-[15px] font-medium transition-all [&[data-state=open]>span>svg]:rotate-180"
          >
            <span class="w-full text-left">
              {group.name}
            </span>
            <span class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent">
              <CaretDown class="size-[18px] transition-transform duration-200" />
            </span>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]"
        >
          <div class="pb-[25px]">
            {#each group.items as item}
              {@render ParamInput(item)}
            {/each}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
</div>

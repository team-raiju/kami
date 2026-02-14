<script lang="ts">
    import { T } from "@threlte/core";
    import { GLTF, useDraco, OrbitControls } from "@threlte/extras";

    const dracoLoader = useDraco();
</script>

<T.PerspectiveCamera makeDefault position={[5.74, 7.11, -8.45]} fov={50}>
    <OrbitControls enableDamping minDistance={2} maxDistance={70} />
</T.PerspectiveCamera>

<T.AmbientLight />
<T.PointLight position={[0, 8, 0]} />

<GLTF url={"/models/raijin.v1.glb"} {dracoLoader} />

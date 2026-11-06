"""Render the current, handless game models. Never edit or export the source GLBs."""
import bpy
import sys
import json
from pathlib import Path
from mathutils import Vector, Matrix

source = Path(sys.argv[sys.argv.index('--') + 1])
output = Path('artifacts/world-showcase/weapon-models').resolve()
output.mkdir(parents=True, exist_ok=True)
assets = {'ak': 'ak-47.glb', 'mp5': 'mp5sd-reward.glb', 'riptide': 'riptide-reward.glb', 'blowhole': 'blowhole-reward.glb'}
report = []
for name, filename in assets.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source / filename))
    bpy.context.view_layer.update()
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    points = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    low = Vector([min(v[i] for v in points) for i in range(3)])
    high = Vector([max(v[i] for v in points) for i in range(3)])
    center = (low + high) / 2
    dims = high - low
    # Put the model's longest dimension across the image, keeping its upright Z.
    longest = max(range(3), key=lambda i: dims[i])
    if longest == 1:
        rotation = Matrix.Rotation(1.57079632679, 4, 'Z')
    elif longest == 2:
        rotation = Matrix.Rotation(1.57079632679, 4, 'Y')
    else:
        rotation = Matrix.Identity(4)
    transform = Matrix.Scale(4 / max(dims), 4) @ rotation @ Matrix.Translation(-center)
    roots = [o for o in bpy.context.scene.objects if o.parent is None]
    for obj in roots:
        obj.matrix_world = transform @ obj.matrix_world
    bpy.context.view_layer.update()
    points = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    floor_z = min(v.z for v in points) - .16
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, floor_z))
    floor = bpy.context.object
    material = bpy.data.materials.new('Sea-green studio')
    material.diffuse_color = (.025, .045, .042, 1)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (.025, .045, .042, 1)
    bsdf.inputs['Roughness'].default_value = .8
    floor.data.materials.append(material)
    scene = bpy.context.scene
    scene.world = bpy.data.worlds.new('Studio world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.12, .17, .18, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .5
    for loc, power, size, color in [((0,-4,5),1400,5,(1,.87,.70)),((1,3,4),1800,3,(.65,.84,1)),((-4,-1,1),500,4,(1,1,1))]:
        bpy.ops.object.light_add(type='AREA', location=loc)
        light = bpy.context.object
        light.data.energy = power
        light.data.shape = 'DISK'
        light.data.size = size
        light.data.color = color
        light.rotation_euler = (-light.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add(location=(2.2,-9,3.2))
    camera = bpy.context.object
    camera.rotation_euler = (-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 5.6
    scene.camera = camera
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1500
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.view_settings.view_transform = 'AgX'
    scene.render.filepath = str(output / f'{name}.png')
    bpy.ops.render.render(write_still=True)
    report.append({'id':name, 'model':filename, 'sourceDimensions':list(dims), 'render':str(output/f'{name}.png')})
(output/'render-manifest.json').write_text(json.dumps(report, indent=2))



import { nanoid } from "nanoid";
import { useCallback, useMemo, useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode } from "react";
import { LiveObject } from "@liveblocks/client"; 
// import {LiveObject} from "../../../../../"
import { Icon } from "@iconify/react";
// import { sidebarInfo } from "../../Data";
// import {sidebarInfo} from "../../Data"
import { hugeData, sidebarInfo } from "../../Data";
import Draggable from 'react-draggable';

import { 
  useHistory, 
  useCanUndo, 
  useCanRedo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
} from "../../../../../liveblocks.config";
import { 
  colorToCss,
  connectionIdToColor, 
  findIntersectingLayersWithRectangle, 
  penPointsToPathLayer, 
  pointerEventToCanvasPoint, 
  resizeBounds,
} from "../../../../lib/utils";
import { 
  Camera, 
  CanvasMode, 
  CanvasState, 
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from "../../../../types/canvas";
import { useDisableScrollBounce } from "../../../../hooks/use-disable-scroll-bounce";
// import { useDisableScrollBounce } from "./hoo";
import { useDeleteLayers } from "../../../../hooks/use-delete-layers";

import { Info } from "./info";
import { Path } from "./path";
import { Toolbar } from "./toolbar";
import { Participants } from "./participants";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { CursorsPresence } from "./cursors-presence";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
};

export const Canvas = ({
  boardId,
}: CanvasProps) => {
  const layerIds = useStorage((root) => root.layerIds);

  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

 

  useDisableScrollBounce();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const insertLayer = useMutation((
    { storage, setMyPresence },
    layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
    position: Point,
  ) => {
    const liveLayers = storage.get("layers");
    if (liveLayers.size >= MAX_LAYERS) {
      return;
    }

    const liveLayerIds = storage.get("layerIds");
    const layerId = nanoid();
    const layer = new LiveObject({
      type: layerType,
      x: position.x,
      y: position.y,
      height: 100,
      width: 100,
      fill: lastUsedColor,
    });

    liveLayerIds.push(layerId);
    liveLayers.set(layerId, layer);

    setMyPresence({ selection: [layerId] }, { addToHistory: true });
    setCanvasState({ mode: CanvasMode.None });
  }, [lastUsedColor]);

  const translateSelectedLayers = useMutation((
    { storage, self },
    point: Point,
  ) => {
    if (canvasState.mode !== CanvasMode.Translating) {
      return;
    }

    const offset = {
      x: point.x - canvasState.current.x,
      y: point.y - canvasState.current.y,
    };

    const liveLayers = storage.get("layers");

    for (const id of self.presence.selection) {
      const layer = liveLayers.get(id);

      if (layer) {
        layer.update({
          x: layer.get("x") + offset.x,
          y: layer.get("y") + offset.y,
        });
      }
    }

    setCanvasState({ mode: CanvasMode.Translating, current: point });
  }, 
  [
    canvasState,
  ]);

  const unselectLayers = useMutation((
    { self, setMyPresence }
  ) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation((
    { storage, setMyPresence },
    current: Point,
    origin: Point,
  ) => {
    const layers = storage.get("layers").toImmutable();
    setCanvasState({
      mode: CanvasMode.SelectionNet,
      origin,
      current,
    });

    const ids = findIntersectingLayersWithRectangle(
      layerIds,
      layers,
      origin,
      current,
    );

    setMyPresence({ selection: ids });
  }, [layerIds]);

  const startMultiSelection = useCallback((
    current: Point,
    origin: Point,
  ) => {
    if (
      Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5
    ) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const continueDrawing = useMutation((
    { self, setMyPresence },
    point: Point,
    e: React.PointerEvent,
  ) => {
    const { pencilDraft } = self.presence;

    if (
      canvasState.mode !== CanvasMode.Pencil ||
      e.buttons !== 1 ||
      pencilDraft == null
    ) {
      return;
    }

    setMyPresence({
      cursor: point,
      pencilDraft:
        pencilDraft.length === 1 &&
        pencilDraft[0][0] === point.x &&
        pencilDraft[0][1] === point.y
          ? pencilDraft
          : [...pencilDraft, [point.x, point.y, e.pressure]],
    });
  }, [canvasState.mode]);

  const insertPath = useMutation((
    { storage, self, setMyPresence }
  ) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;

    if (
      pencilDraft == null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }

    const id = nanoid();
    liveLayers.set(
      id,
      new LiveObject(penPointsToPathLayer(
        pencilDraft,
        lastUsedColor,
      )),
    );

    const liveLayerIds = storage.get("layerIds");
    liveLayerIds.push(id);

    setMyPresence({ pencilDraft: null });
    setCanvasState({ mode: CanvasMode.Pencil });
  }, [lastUsedColor]);

  const startDrawing = useMutation((
    { setMyPresence },
    point: Point,
    pressure: number,
  ) => {
    setMyPresence({
      pencilDraft: [[point.x, point.y, pressure]],
      penColor: lastUsedColor,
    })
  }, [lastUsedColor]);

  const resizeSelectedLayer = useMutation((
    { storage, self },
    point: Point,
  ) => {
    if (canvasState.mode !== CanvasMode.Resizing) {
      return;
    }

    const bounds = resizeBounds(
      canvasState.initialBounds,
      canvasState.corner,
      point,
    );

    const liveLayers = storage.get("layers");
    const layer = liveLayers.get(self.presence.selection[0]);

    if (layer) {
      layer.update(bounds);
    };
  }, [canvasState]);

  const onResizeHandlePointerDown = useCallback((
    corner: Side,
    initialBounds: XYWH,
  ) => {
    history.pause();
    setCanvasState({
      mode: CanvasMode.Resizing,
      initialBounds,
      corner,
    });
  }, [history]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera:any) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerMove = useMutation((
    { setMyPresence }, 
    e: React.PointerEvent
  ) => {
    e.preventDefault();

    const current = pointerEventToCanvasPoint(e, camera);

    if (canvasState.mode === CanvasMode.Pressing) {
      startMultiSelection(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.SelectionNet) {
      updateSelectionNet(current, canvasState.origin);
    } else if (canvasState.mode === CanvasMode.Translating) {
      translateSelectedLayers(current);
    } else if (canvasState.mode === CanvasMode.Resizing) {
      resizeSelectedLayer(current);
    } else if (canvasState.mode === CanvasMode.Pencil) {
      continueDrawing(current, e);
    }

    setMyPresence({ cursor: current });
  }, 
  [
    continueDrawing,
    camera,
    canvasState,
    resizeSelectedLayer,
    translateSelectedLayers,
    startMultiSelection,
    updateSelectionNet,
  ]);

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerDown = useCallback((
    e: React.PointerEvent,
  ) => {
    const point = pointerEventToCanvasPoint(e, camera);

    if (canvasState.mode === CanvasMode.Inserting) {
      return;
    }

    if (canvasState.mode === CanvasMode.Pencil) {
      startDrawing(point, e.pressure);
      return;
    }

    setCanvasState({ origin: point, mode: CanvasMode.Pressing });
  }, [camera, canvasState.mode, setCanvasState, startDrawing]);

  const onPointerUp = useMutation((
    {},
    e
  ) => {
    const point = pointerEventToCanvasPoint(e, camera);

    if (
      canvasState.mode === CanvasMode.None ||
      canvasState.mode === CanvasMode.Pressing
    ) {
      unselectLayers();
      setCanvasState({
        mode: CanvasMode.None,
      });
    } else if (canvasState.mode === CanvasMode.Pencil) {
      insertPath();
    } else if (canvasState.mode === CanvasMode.Inserting) {
      insertLayer(canvasState.layerType, point);
    } else {
      setCanvasState({
        mode: CanvasMode.None,
      });
    }

    history.resume();
  }, 
  [
    setCanvasState,
    camera,
    canvasState,
    history,
    insertLayer,
    unselectLayers,
    insertPath
  ]);

  const selections = useOthersMapped((other) => other.presence.selection);

  const onLayerPointerDown = useMutation((
    { self, setMyPresence },
    e: React.PointerEvent,
    layerId: string,
  ) => {
    if (
      canvasState.mode === CanvasMode.Pencil ||
      canvasState.mode === CanvasMode.Inserting
    ) {
      return;
    }

    history.pause();
    e.stopPropagation();

    const point = pointerEventToCanvasPoint(e, camera);

    if (!self.presence.selection.includes(layerId)) {
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
    }
    setCanvasState({ mode: CanvasMode.Translating, current: point });
  }, 
  [
    setCanvasState,
    camera,
    history,
    canvasState.mode,
  ]);

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId)
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

  const deleteLayers = useDeleteLayers();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        // case "Backspace":
        //   deleteLayers();
        //   break;
        case "z": {
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
            break;
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [deleteLayers, history]);

  const [searchImage, setSearchImages] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showCancelBtn, setShowCancelButton] = useState(false)
  
  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };
      
  const handleSearchImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchImages(searchTerm);
    
    // Check if the searched image exists in any dropdown items
    const foundDropdown = sidebarInfo.find(category=> 
      category.items.some((item: { name: string; }) => item.name.toLowerCase().includes(searchTerm))
    );
    
    if (foundDropdown) {
      setOpenDropdown(foundDropdown.title);
    } else {
      setOpenDropdown(null);
    }
  };
  
  const filterImages = sidebarInfo?.flatMap(category => category.items)
    .filter(item => item.name.toLowerCase().includes(searchImage));
  
  console.log(filterImages, "filterImages");
  
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImages(prevImages => [...prevImages, imageUrl]);
  };
  
  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };
  
  return (
    <main className="h-full relative w-full bg-neutral-100 touch-none">
      <div className="absolute top-[3vw] left-[30vw] cursor-pointer w-full max-w-[5vw]">
        {selectedImages.map((image, index) => (
          <div key={index}>
            <Draggable>
              <section className="relative">
                {showCancelBtn && <p className="p-[0.5vw] absolute top-0 right-0 cursor-pointer flex items-center justify-center bg-[#383737] w-[1vw] h-[1vw] text-white text-center rounded-full text-[0.7vw]" onClick={() => removeImage(index)}>x</p>}
                <img onClick={()=> setShowCancelButton(true)}  src={image} alt={`Selected image ${index}`} className="w-full" />
              </section>
            </Draggable>
          </div>
        ))}
      </div>
      <div className="absolute bg-white  w-full max-w-[21.5vw] shadow-lg rounded-lg  p-[1vw] left-0 top-[7vw] h-[40vw]">
        <nav className="flex items-center p-[0.7vw] rounded-full bg-gray-100">
          <Icon icon="charm:search" className="text-[1.3vw] text-gray-500" />
          <input type="text" placeholder="Search..." onChange={handleSearchImage} className="w-full ml-[0.5vw] text-[1vw] border-none focus:outline-none bg-inherit" />
        </nav>
        <aside className="mt-[1vw] w-full p-[0.5vw] scrollbar-hide overflow-y-scroll h-[25vw]">
        {searchImage && (
        <div className="w-full">
          <div className="w-full mb-[0.5vw]">
            <figure>
             {filterImages[0]?.img && <img src={filterImages[0]?.img} onClick={() => handleImageSelect(filterImages[0]?.img)} alt={filterImages[0]?.name} className="w-[2vw] cursor-pointer h-[2vw] m-[0.5vw]" />}
              <span className="text-[0.8vw] w-[3vw] text-center">{filterImages[0]?.name}</span>
            </figure>
          </div>
        </div>
      )}
       {sidebarInfo?.map((item, index) => (
    <div className="w-full" key={index}>
      <p className="text-[1vw] hover:bg-slate-50 border-b-[0.1vw] p-[0.3vw] flex justify-between items-center font-bold text-gray-500 mb-[0.5vw] cursor-pointer" onClick={() => toggleDropdown(item?.title)}>
        <span>{item.title}</span>
        <Icon icon="ep:arrow-down-bold" className="text-[1vw] text-gray-700" />
      </p>
      {openDropdown === item.title && (
        <div className="grid grid-cols-2 gap-[1vw] w-full">
          {item.items.map((imageItem: { img: string | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; }, imageIndex: Key | null | undefined) => (
            <figure key={imageIndex}>
             <img src={(imageItem?.img?? '') as string} onClick={() => handleImageSelect((imageItem?.img?? '') as string)} alt={(imageItem?.name?? '') as string} className="w-[2vw] cursor-pointer h-[2vw] m-[0.5vw]" />
              <span className="text-[0.8vw] w-[3vw] text-center">{imageItem?.name}</span>
            </figure>
          ))}
        </div>
      )}
    </div>
     ))}
    </aside>
    <div className="-mt-[1vw] ml-[5vw]">
        {/* <Draggable> */}
              <section className="relative w-full max-w-[7vw]" onClick={()=> setSelectedImages([...selectedImages, '/logo.png'])}>
                <img  src={'/logo.png'} alt={`Selected image`} className="w-full" />
              </section>
            {/* </Draggable> */}
        </div>
      </div>
      <Info boardId={boardId} />
      <Participants />
     <aside className="absolute right-[5vw] top-[23vw]">
     <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />
     </aside>
      <SelectionTools
        camera={camera}
        setLastUsedColor={setLastUsedColor}
      />
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`
          }}
        >
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox
            onResizeHandlePointerDown={onResizeHandlePointerDown}
          />
          {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
            <rect
              className="fill-blue-500/5 stroke-blue-500 stroke-1"
              x={Math.min(canvasState.origin.x, canvasState.current.x)}
              y={Math.min(canvasState.origin.y, canvasState.current.y)}
              width={Math.abs(canvasState.origin.x - canvasState.current.x)}
              height={Math.abs(canvasState.origin.y - canvasState.current.y)}
            />
          )}
          <CursorsPresence />
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};

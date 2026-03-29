// src/canvas/OrganicCanvas.tsx
import React, { useState, useMemo } from "react";
import { Stage, Layer, Line, Circle, Text } from "react-konva";
import { useMoleculeStore } from "../store/useMoleculeStore";
import { ELEMENT_DATA } from "../utils/elements";
import { OrganicBondLine } from "./OrganicBondLine";
import { Atom } from "../types/molecule";

const BOND_LENGTH = 50; // Comprimento padrão de uma ligação orgânica

export const OrganicCanvas: React.FC = () => {
  const width = window.innerWidth - 220;
  const height = window.innerHeight;

  const allAtoms = useMoleculeStore((state) => state.atoms);
  const allBonds = useMoleculeStore((state) => state.bonds);

  // 2. Filtramos localmente para obter apenas os orgânicos
  const atoms = useMemo(() => {
    const filtered: Record<string, Atom> = {};
    for (const key in allAtoms) {
      if (allAtoms[key].x !== undefined) {
        filtered[key] = allAtoms[key];
      }
    }
    return filtered;
  }, [allAtoms]);

  const bonds = useMemo(() => {
    return allBonds.filter((b) => allAtoms[b.sourceId]?.x !== undefined);
  }, [allBonds, allAtoms]);
  const addOrganicConnection = useMoleculeStore(
    (state) => state.addOrganicConnection,
  );

  // Estados locais para controlar o desenho da linha fantasma enquanto arrastamos
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [hoveredAtomId, setHoveredAtomId] = useState<string | null>(null);
  const [hoveredBondId, setHoveredBondId] = useState<string | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const activePaletteElement = useMoleculeStore(
    (state) => state.activePaletteElement,
  );
  const modifyOrganicBond = useMoleculeStore(
    (state) => state.modifyOrganicBond,
  );
  const modifyOrganicAtom = useMoleculeStore(
    (state) => state.modifyOrganicAtom,
  ); // NOVO
  const addOrganicRing = useMoleculeStore((state) => state.addOrganicRing);
  const addFusedRing = useMoleculeStore((state) => state.addFusedRing);
  const removeAtom = useMoleculeStore((state) => state.removeAtom); // Já existia, vamos puxá-lo

  const isElementTool = (tool: string | null) => {
    if (!tool) return false;
    return Object.keys(ELEMENT_DATA).includes(tool) && tool !== "DEFAULT";
  };

  const handleMouseDown = (e: any) => {
    // Evita conflitos com outros elementos de UI
    if (e.target.name() === "UI_ELEMENT") return;

    const pos = e.target.getStage().getPointerPosition();

    if (activePaletteElement && activePaletteElement.startsWith("RING_")) {
      if (hoveredAtomId && atoms[hoveredAtomId]) {
        // Ancorar o anel a um átomo existente (ex: tolueno)
        addOrganicRing(pos.x, pos.y, activePaletteElement, hoveredAtomId);
      } else {
        // Estampar um anel solto no vazio
        addOrganicRing(pos.x, pos.y, activePaletteElement);
      }
      return;
    }

    setIsDrawing(true);

    if (hoveredAtomId && atoms[hoveredAtomId]) {
      const atom = atoms[hoveredAtomId];
      setStartPos({ x: atom.x!, y: atom.y! });
      setDragSourceId(atom.id); // SALVA O ÁTOMO DE ORIGEM
    } else {
      setStartPos(pos);
      setDragSourceId(null);
    }
    setEndPos(pos);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();

    // NOVA FÍSICA: O Ímã de fechamento de ciclo!
    let snappedToAtom = false;

    for (const atom of Object.values(atoms)) {
      if (atom.id === dragSourceId) continue; // Não tenta grudar no átomo de onde saiu

      if (atom.x !== undefined && atom.y !== undefined) {
        // Calcula a distância do PONTEIRO DO RATO (pos) até o átomo
        const distToAtom = Math.hypot(atom.x - pos.x, atom.y - pos.y);

        // Se o rato chegar a menos de 25 píxeis de um átomo existente...
        if (distToAtom < 25) {
          setEndPos({ x: atom.x, y: atom.y }); // ...quebra as regras e gruda nele!
          snappedToAtom = true;
          break;
        }
      }
    }

    // Se não ativou o ímã, usa a física normal (zigue-zague com 30º e 50px)
    if (!snappedToAtom) {
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const angle = Math.atan2(dy, dx);
      const snapAngle = Math.round(angle / (Math.PI / 6)) * (Math.PI / 6);

      const finalX = startPos.x + Math.cos(snapAngle) * BOND_LENGTH;
      const finalY = startPos.y + Math.sin(snapAngle) * BOND_LENGTH;
      setEndPos({ x: finalX, y: finalY });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const dist = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);
    if (dist > 10) {
      let targetAtomId: string | null = null;

      for (const atom of Object.values(atoms)) {
        if (atom.id === dragSourceId) continue;
        if (atom.x !== undefined && atom.y !== undefined) {
          // Como o MouseMove já grudou o endPos em cima do átomo, a distância será 0!
          const distanceToAtom = Math.hypot(
            atom.x - endPos.x,
            atom.y - endPos.y,
          );
          if (distanceToAtom < 5) {
            targetAtomId = atom.id;
            break;
          }
        }
      }

      addOrganicConnection(
        dragSourceId,
        targetAtomId,
        startPos.x,
        startPos.y,
        endPos.x,
        endPos.y,
      );
    }

    setDragSourceId(null); // Limpa o estado
  };

  return (
    <Stage
      width={width}
      height={height}
      style={{
        marginLeft: "220px",
        backgroundColor: "#ecf0f1",
        cursor: "crosshair",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {/* Renderiza as Ligações Salvas */}
        {bonds.map((bond) => {
          const s = atoms[bond.sourceId];
          const t = atoms[bond.targetId];

          if (
            !s ||
            !t ||
            s.x === undefined ||
            s.y === undefined ||
            t.x === undefined ||
            t.y === undefined
          )
            return null;

          // Lógica visual básica (cores e tracejados para representar os tipos)
          let strokeColor = "#2c3e50";
          let strokeWidth = 3;
          let dash: number[] | undefined = undefined;

          if (bond.order === 2) strokeWidth = 7;
          if (bond.order === 3) strokeWidth = 11;

          if (bond.stereo === "wedge") {
            strokeColor = "#27ae60";
            strokeWidth = 6;
          } else if (bond.stereo === "dash") {
            strokeColor = "#c0392b";
            dash = [4, 4];
          }

          if (hoveredBondId === bond.id && activePaletteElement) {
            if (activePaletteElement.startsWith("RING_")) {
              strokeColor = "#f39c12"; // Laranja: Fusão de anel
            } else if (activePaletteElement === "ERASER") {
              strokeColor = "#e74c3c"; // Vermelho: Apagar
            } else if (activePaletteElement.startsWith("BOND_")) {
              strokeColor = "#3498db"; // Azul: Mudar ligação
            }
          }

          // Renderize o novo componente orgânico em vez da <Line>
          return (
            <OrganicBondLine
              key={bond.id}
              id={bond.id}
              s={{ x: s.x!, y: s.y! }}
              t={{ x: t.x!, y: t.y! }}
              order={bond.order}
              stereo={bond.stereo}
              strokeColor={strokeColor}
              onMouseDown={(e) => {
                e.cancelBubble = true;
                if (
                  activePaletteElement &&
                  activePaletteElement.startsWith("RING_")
                ) {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  const pos = stage.getPointerPosition();
                  if (!pos) return;
                  addFusedRing(bond.id, activePaletteElement, pos.x, pos.y);
                } else if (activePaletteElement) {
                  modifyOrganicBond(bond.id, activePaletteElement);
                }
              }}
              onMouseEnter={() => setHoveredBondId(bond.id)}
              onMouseLeave={() => setHoveredBondId(null)}
            />
          );
        })}

        {/* Renderiza os Vértices (Átomos) Salvos */}
        {Object.values(atoms)
          .filter(
            (a) => a.x !== undefined && a.y !== undefined && a.element !== "C",
          )
          .map((atom) => (
            <Circle
              key={`bg_${atom.id}`}
              x={atom.x!}
              y={atom.y!}
              radius={14}
              fill="#ecf0f1" // Cor exata do fundo do Canvas para esconder a linha
              listening={false}
            />
          ))}

        {/* 2. TEXTOS DOS HETEROÁTOMOS */}
        {/* Desenhados depois, garantindo que NENHUM fundo cobre NENHUMA letra */}
        {Object.values(atoms)
          .filter(
            (a) => a.x !== undefined && a.y !== undefined && a.element !== "C",
          )
          .map((atom) => {
            const color = ELEMENT_DATA[atom.element]?.color || "#2c3e50";
            return (
              <Text
                key={`text_${atom.id}`}
                x={atom.x!}
                y={atom.y!}
                text={atom.element}
                fontSize={18}
                fontStyle="bold"
                fill={color}
                listening={false}
                offsetX={atom.element.length > 1 ? 10 : 6}
                offsetY={8}
              />
            );
          })}

        {/* 3. ÁREAS DE CLIQUE INVISÍVEIS (Hitboxes) */}
        {/* Ficam na frente de tudo para capturar o rato com perfeição */}
        {Object.values(atoms)
          .filter((a) => a.x !== undefined && a.y !== undefined)
          .map((atom) => (
            <Circle
              key={`hit_${atom.id}`}
              x={atom.x!}
              y={atom.y!}
              radius={15}
              fill="transparent"
              onMouseDown={(e) => {
                if (activePaletteElement === "ERASER") {
                  e.cancelBubble = true;
                  removeAtom(atom.id);
                } else if (isElementTool(activePaletteElement)) {
                  e.cancelBubble = true;
                  modifyOrganicAtom(atom.id, activePaletteElement!);
                }
              }}
              onMouseEnter={(e) => {
                setHoveredAtomId(atom.id);
                const stage = e.target.getStage();
                if (
                  stage &&
                  (isElementTool(activePaletteElement) ||
                    activePaletteElement === "ERASER")
                ) {
                  stage.container().style.cursor = "pointer";
                }
              }}
              onMouseLeave={(e) => {
                setHoveredAtomId(null);
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "crosshair";
              }}
            />
          ))}

        {/* 4. RENDERIZA A LINHA FANTASMA E A BOLINHA DE HOVER (Mantenha o código que já tinha aqui) */}
        {isDrawing && (
          <Line
            points={[startPos.x, startPos.y, endPos.x, endPos.y]}
            stroke="#3498db"
            strokeWidth={3}
            dash={[5, 5]}
          />
        )}

        {hoveredAtomId &&
          !isDrawing &&
          atoms[hoveredAtomId]?.x !== undefined && (
            <Circle
              x={atoms[hoveredAtomId].x!}
              y={atoms[hoveredAtomId].y!}
              // NOVO: Aumenta a bolinha se for adicionar um anel, senão mantém tamanho 6
              radius={activePaletteElement?.startsWith("RING_") ? 10 : 6}
              // NOVO: Fica vermelho se for apagar, azul para o resto
              fill={activePaletteElement === "ERASER" ? "#e74c3c" : "#3498db"}
              opacity={0.6}
              listening={false}
            />
          )}
      </Layer>
    </Stage>
  );
};

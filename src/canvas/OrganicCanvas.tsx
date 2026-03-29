// src/canvas/OrganicCanvas.tsx
import React, { useState } from "react";
import { Stage, Layer, Line, Circle, Group, Text } from "react-konva";
import { useMoleculeStore } from "../store/useMoleculeStore";
import { ELEMENT_DATA } from "../utils/elements";

const BOND_LENGTH = 50; // Comprimento padrão de uma ligação orgânica

export const OrganicCanvas: React.FC = () => {
  const width = window.innerWidth - 220;
  const height = window.innerHeight;

  const atoms = useMoleculeStore((state) => state.atoms);
  const bonds = useMoleculeStore((state) => state.bonds);
  const addOrganicConnection = useMoleculeStore(
    (state) => state.addOrganicConnection,
  );

  // Estados locais para controlar o desenho da linha fantasma enquanto arrastamos
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [hoveredAtomId, setHoveredAtomId] = useState<string | null>(null);
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
      addOrganicRing(pos.x, pos.y, activePaletteElement);
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

          if (bond.order === 2) strokeWidth = 7; // Mais grossa para simular dupla
          if (bond.order === 3) strokeWidth = 11; // Muito grossa para tripla

          if (bond.stereo === "wedge") {
            strokeColor = "#27ae60"; // Verde para cunha (frente)
            strokeWidth = 6;
          } else if (bond.stereo === "dash") {
            strokeColor = "#c0392b"; // Vermelho para traço (trás)
            dash = [4, 4]; // Tracejado
          }

          return (
            <Line
              key={bond.id}
              points={[s.x!, s.y!, t.x!, t.y!]}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              dash={dash}
              lineCap="round"
              hitStrokeWidth={15} // Aumenta a área de clique invisível da linha para facilitar
              onMouseDown={(e) => {
                // Impede que o clique na linha crie uma nova ligação no fundo da tela
                e.cancelBubble = true;
                if (activePaletteElement) {
                  modifyOrganicBond(bond.id, activePaletteElement);
                }
              }}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "pointer";
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "crosshair";
              }}
            />
          );
        })}

        {/* Renderiza os Vértices (Átomos) Salvos */}
        {Object.values(atoms)
          .filter((a) => a.x !== undefined && a.y !== undefined)
          .map((atom) => {
            const isHeteroatom = atom.element !== "C";
            const color = ELEMENT_DATA[atom.element]?.color || "#2c3e50";

            return (
              <Group
                key={atom.id}
                x={atom.x!}
                y={atom.y!}
                onMouseDown={(e) => {
                  if (activePaletteElement === "ERASER") {
                    // Borracha apaga o átomo e as ligações a ele
                    e.cancelBubble = true;
                    removeAtom(atom.id);
                  } else if (isElementTool(activePaletteElement)) {
                    // Transforma o vértice no heteroátomo selecionado
                    e.cancelBubble = true;
                    modifyOrganicAtom(atom.id, activePaletteElement!);
                  }
                  // IMPORTANTE: Se não for Borracha nem Átomo (ou seja, se for uma ferramenta de ligação),
                  // deixamos o evento "borbulhar" para o Stage começar a desenhar uma linha a partir daqui!
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
              >
                {/* 1. FUNDO PROTETOR (Apenas se for heteroátomo) */}
                {/* Esconde as linhas das ligações que passam por baixo do texto */}
                {isHeteroatom && (
                  <Circle radius={14} fill="#ecf0f1" listening={false} />
                )}

                {/* 2. TEXTO DO ELEMENTO (Ex: "O", "NH2", "Cl") */}
                {isHeteroatom && (
                  <Text
                    text={atom.element}
                    fontSize={18}
                    fontStyle="bold"
                    fill={color}
                    listening={false}
                    offsetX={atom.element.length > 1 ? 10 : 6} // Centraliza um pouco melhor se tiver mais letras
                    offsetY={8}
                  />
                )}

                {/* 3. ÁREA DE CLIQUE INVISÍVEL */}
                <Circle radius={15} fill="transparent" />
              </Group>
            );
          })}

        {/* Renderiza a Linha Fantasma sendo arrastada */}
        {isDrawing && (
          <Line
            points={[startPos.x, startPos.y, endPos.x, endPos.y]}
            stroke="#3498db"
            strokeWidth={3}
            dash={[5, 5]}
          />
        )}

        {/* Destaque visual (bolinha azul) se o rato passar por cima de um vértice existente */}
        {hoveredAtomId &&
          !isDrawing &&
          atoms[hoveredAtomId]?.x !== undefined && (
            <Circle
              // CORREÇÃO: Adicionamos o "!" aqui também
              x={atoms[hoveredAtomId].x!}
              y={atoms[hoveredAtomId].y!}
              radius={6}
              fill="#3498db"
              opacity={0.6}
              listening={false}
            />
          )}
      </Layer>
    </Stage>
  );
};

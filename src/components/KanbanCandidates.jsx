import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { apiService } from '../services/api';

const stages = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected'
];

const KanbanCandidates = () => {
  const [candidatesByStage, setCandidatesByStage] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCandidates({});
      const grouped = stages.reduce((acc, stage) => {
        acc[stage] = response.data.filter(c => c.stage === stage);
        return acc;
      }, {});
      setCandidatesByStage(grouped);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    const candidate = candidatesByStage[sourceStage][source.index];

    // Remove from source
    const newSourceList = Array.from(candidatesByStage[sourceStage]);
    newSourceList.splice(source.index, 1);
    // Add to destination
    const newDestList = Array.from(candidatesByStage[destStage]);
    newDestList.splice(destination.index, 0, { ...candidate, stage: destStage });

    setCandidatesByStage({
      ...candidatesByStage,
      [sourceStage]: newSourceList,
      [destStage]: newDestList
    });

    // Persist change
    try {
      await apiService.updateCandidateStage(candidate.id, destStage);
    } catch (error) {
      console.error('Failed to update candidate stage:', error);
      // Rollback on error
      loadCandidates();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {stages.map(stage => (
          <Droppable droppableId={stage} key={stage}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-white rounded-lg shadow-sm border w-64 min-h-[300px] p-2"
              >
                <h2 className="font-bold text-center mb-2">{stage}</h2>
                {candidatesByStage[stage].map((candidate, idx) => (
                  <Draggable key={candidate.id} draggableId={candidate.id.toString()} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-indigo-50 rounded p-2 mb-2 shadow"
                      >
                        <div className="font-semibold">{candidate.name}</div>
                        <div className="text-xs text-gray-600">{candidate.email}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default KanbanCandidates;

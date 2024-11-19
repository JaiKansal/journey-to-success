import { motion } from 'framer-motion';
import styled from 'styled-components';

// New styled components for the todo and progress features
const DraggableProgress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(45deg, #FF8C69, #FF6B6B);
  border-radius: 6px;
  cursor: grab;
  position: relative;

  &:active {
    cursor: grabbing;
  }
`

const TodoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled(motion.div)`
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 140, 105, 0.2);
`

const TodoInput = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  input {
    flex: 1;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 140, 105, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`

const TodoItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  gap: 1rem;
`

export const DailyTip = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 15px;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 140, 105, 0.2);
`

export const TipTitle = styled.h3`
  color: #FF8C69;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`

export const TodoText = styled.p<{ $completed: boolean }>`
  flex: 1;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  color: ${props => props.$completed ? '#FFA07A' : 'white'};
`

export const ButtonIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.2rem;
`

// Add more styled components as needed... 
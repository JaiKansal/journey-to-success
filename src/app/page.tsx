'use client'

import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { motion, Reorder } from 'framer-motion'

interface Todo {
  id: string
  text: string
  completed: boolean
  category: 'personal' | 'work' | 'health' | 'learning'
  dueDate?: string
}

interface Goal {
  name: string
  progress: number
  target: number
  color: string
}

// Add prop type for the ActionButton
interface ActionButtonProps {
  small?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

// Create an interface for stored data
interface StoredData {
  lastVisitDate: string;
  streak: number;
  todos: Todo[];
  goals: Goal[];
}

interface DailyTip {
  text: string;
  date: string;
}

export default function Home() {
  const [quote, setQuote] = useState({ text: '', author: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [dailyStreak, setDailyStreak] = useState(0)
  const [lastVisit, setLastVisit] = useState<string | null>(null)
  const [showTodoModal, setShowTodoModal] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Todo['category']>('personal')
  const [goals, setGoals] = useState<Goal[]>([
    { name: 'Health', progress: 65, target: 100, color: '#FF8C69' },
    { name: 'Career', progress: 80, target: 100, color: '#FF6B6B' },
    { name: 'Learning', progress: 45, target: 100, color: '#FFA07A' },
    { name: 'Mindfulness', progress: 70, target: 100, color: '#FFB6C1' }
  ])

  const dragConstraintsRef = useRef(null)

  const handleDragProgress = (name: string, progress: number) => {
    setGoals(goals.map(goal => 
      goal.name === name 
        ? { ...goal, progress: Math.min(100, Math.max(0, progress)) }
        : goal
    ))
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        category: selectedCategory,
        dueDate: new Date().toISOString().split('T')[0]
      }])
      setNewTodo('')
    }
  }

  // Function to fetch quote with better error handling
  const fetchQuote = async () => {
    setIsLoading(true)
    try {
      // Using the Ninja API for quotes (more reliable)
      const response = await fetch('https://api.api-ninjas.com/v1/quotes?category=inspirational', {
        headers: {
          'X-Api-Key': 'YOUR_API_NINJA_KEY', // You'll need to get a free API key from api-ninjas.com
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Quote fetch failed')
      }
      
      const [data] = await response.json()
      setQuote({ text: data.quote, author: data.author })
    } catch (error) {
      console.log('Error fetching quote:', error)
      // Use local quotes as fallback
      const randomIndex = Math.floor(Math.random() * localQuotes.length)
      setQuote(localQuotes[randomIndex])
    } finally {
      setIsLoading(false)
    }
  }

  // Local quotes a

  const localQuotes = [
    {
      text: "You are not a drop in the ocean. You are the entire ocean in a drop.",
      author: "Rumi"
    },
    {
      text: "She believed she could, so she did.",
      author: "R.S. Grey"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "You are enough just as you are.",
      author: "Meghan Markle"
    },
    {
      text: "I have learned not to allow rejection to move me.",
      author: "Cicely Tyson"
    },
    {
      text: "Above all, be the heroine of your life, not the victim.",
      author: "Nora Ephron"
    },
    {
      text: "I'm not afraid of storms, for I'm learning how to sail my ship.",
      author: "Louisa May Alcott"
    },
    {
      text: "The most difficult thing is the decision to act, the rest is merely tenacity.",
      author: "Amelia Earhart"
    },
    {
      text: "Life is not about waiting for the storm to pass, it's about learning to dance in the rain.",
      author: "Vivian Greene"
    },
    {
      text: "The question isn't who's going to let me; it's who is going to stop me.",
      author: "Ayn Rand"
    }
  ]

  useEffect(() => {
    fetchQuote()
    checkDailyStreak()
  }, [])

  const checkDailyStreak = () => {
    const today = new Date().toDateString()
    const lastVisitDate = localStorage.getItem('lastVisit')
    
    if (lastVisitDate) {
      const streak = parseInt(localStorage.getItem('streak') || '1')
      if (lastVisitDate !== today) {
        setDailyStreak(streak + 1)
        localStorage.setItem('streak', (streak + 1).toString())
      } else {
        setDailyStreak(streak)
      }
    }
    
    localStorage.setItem('lastVisit', today)
    setLastVisit(today)
  }

  useEffect(() => {
    // Load and update streak
    const updateStreak = () => {
      const storedData = localStorage.getItem('journeyData');
      const today = new Date().toDateString();

      if (storedData) {
        const data: StoredData = JSON.parse(storedData);
        
        if (data.lastVisitDate !== today) {
          // Check if last visit was yesterday
          const lastVisit = new Date(data.lastVisitDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastVisit.toDateString() === yesterday.toDateString()) {
            // Increment streak if last visit was yesterday
            const newStreak = (data.streak || 0) + 1;
            setDailyStreak(newStreak);
            
            // Update stored data
            localStorage.setItem('journeyData', JSON.stringify({
              ...data,
              lastVisitDate: today,
              streak: newStreak,
              todos: [] // Reset todos for new day
            }));
          } else {
            // Reset streak if missed a day
            setDailyStreak(1);
            localStorage.setItem('journeyData', JSON.stringify({
              ...data,
              lastVisitDate: today,
              streak: 1,
              todos: []
            }));
          }
        } else {
          // Same day - keep current streak
          setDailyStreak(data.streak || 1);
        }
      } else {
        // First visit ever
        setDailyStreak(1);
        localStorage.setItem('journeyData', JSON.stringify({
          lastVisitDate: today,
          streak: 1,
          todos: [],
          goals: []
        }));
      }
    };

    updateStreak();
  }, []);

  // Update localStorage whenever todos or goals change
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('journeyData', JSON.stringify({
      lastVisitDate: today,
      todos,
      dailyTip: dailyTips.indexOf(currentTip),
      goals
    }));
  }, [todos, goals]);

  // Array of daily tips
  const dailyTips = [
    "Take a moment to celebrate your progress, no matter how small. You're growing stronger every day!",
    "Remember to breathe deeply and take breaks when needed.",
    "Stay hydrated and nourish your body today.",
    "Take a 5-minute break to stretch and move.",
    "Practice gratitude by noting three good things about today.",
    "Connect with someone you care about today.",
    "Give yourself permission to say 'no' when needed.",
    "Celebrate small wins - they add up to big victories!",
    "Take a moment to appreciate how far you've come.",
    "Remember: progress over perfection!"
  ];

  const [currentTip, setCurrentTip] = useState(dailyTips[0]);

  const [dailyTip, setDailyTip] = useState<DailyTip>({ 
    text: "Take a moment to celebrate your progress, no matter how small. You're growing stronger every day!", 
    date: new Date().toDateString() 
  });

  // Fallback tips in case API fails
  const fallbackTips = [
    "Take a moment to celebrate your progress, no matter how small. You're growing stronger every day!",
    "Remember to breathe deeply and take breaks when needed.",
    "Stay hydrated and nourish your body today.",
    "Practice self-compassion and be kind to yourself.",
    "Take small steps towards your goals - they all count!"
  ];

  const fetchDailyTip = async () => {
    const storedTip = localStorage.getItem('dailyTip');
    const today = new Date().toDateString();

    // If we have a stored tip and it's from today, use it
    if (storedTip) {
      const parsedTip: DailyTip = JSON.parse(storedTip);
      if (parsedTip.date === today) {
        setDailyTip(parsedTip);
        return;
      }
    }

    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes?category=happiness', {
        headers: {
          'X-Api-Key': process.env.NEXT_PUBLIC_NINJA_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tip');

      const [data] = await response.json();
      
      const newTip: DailyTip = {
        text: data.quote,
        date: today
      };

      // Store in localStorage
      localStorage.setItem('dailyTip', JSON.stringify(newTip));
      setDailyTip(newTip);

    } catch (error) {
      console.error('Error fetching daily tip:', error);
      // Use a random fallback tip if API fails
      const fallbackTip: DailyTip = {
        text: fallbackTips[Math.floor(Math.random() * fallbackTips.length)],
        date: today
      };
      localStorage.setItem('dailyTip', JSON.stringify(fallbackTip));
      setDailyTip(fallbackTip);
    }
  };

  useEffect(() => {
    fetchDailyTip();
  }, []);

  return (
    <Container>
      <Header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Your Journey to Success</h1>
        <p>Track your progress, celebrate your wins</p>
      </Header>

      <StreakCard>
        <StreakCount>🔥 {dailyStreak} Day Streak!</StreakCount>
        <StreakMessage>Keep going, you're doing amazing!</StreakMessage>
      </StreakCard>

      <QuoteCard
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isLoading ? (
          <LoadingQuote>✨ Loading inspiration...</LoadingQuote>
        ) : (
          <>
            <Quote>{quote.text}</Quote>
            <QuoteAuthor>- {quote.author}</QuoteAuthor>
          </>
        )}
        <StyledQuoteButton 
          onClick={fetchQuote}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span>Loading...</span>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⌛
              </motion.span>
            </>
          ) : (
            <>
              <span>New Quote</span>
              <span>✨</span>
            </>
          )}
        </StyledQuoteButton>
      </QuoteCard>

      <DailyTip>
        <TipTitle>💫 Daily Self-Care Tip</TipTitle>
        <TipText>
          {dailyTip.text}
        </TipText>
      </DailyTip>

      <ButtonContent>
        <TasksGoalsButton
          onClick={() => setShowTodoModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          <ButtonText>
            <span>Tasks</span>
            <span>&</span>
            <span>Goals</span>
          </ButtonText>
        </TasksGoalsButton>
      </ButtonContent>

      <ProgressSection>
        <SectionTitle>
          <h2>Track Your Progress</h2>
          <p>Drag to update or use buttons</p>
        </SectionTitle>
        <GoalGrid ref={dragConstraintsRef}>
          {goals.map((goal) => (
            <GoalCard key={goal.name}>
              <GoalTitle style={{ color: goal.color }}>{goal.name}</GoalTitle>
              <ProgressBarContainer>
                <ProgressLabel>{goal.progress}%</ProgressLabel>
                <ProgressBar>
                  <DraggableProgress
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={dragConstraintsRef}
                    dragElastic={0}
                    dragMomentum={false}
                    style={{ background: goal.color }}
                    onDrag={(event, info) => {
                      const target = event.currentTarget as HTMLElement;
                      if (!target) return;
                      
                      const progressBar = target.parentElement;
                      if (progressBar) {
                        const rect = progressBar.getBoundingClientRect();
                        const relativeX = info.point.x - rect.left;
                        const progress = Math.min(100, Math.max(0, (relativeX / rect.width) * 100));
                        handleDragProgress(goal.name, progress);
                      }
                    }}
                  />
                </ProgressBar>
                <ProgressControls>
                  <ActionButton 
                    small="true"
                    onClick={() => handleDragProgress(goal.name, Math.max(0, goal.progress - 5))}
                  >
                    -
                  </ActionButton>
                  <ActionButton 
                    small="true"
                    onClick={() => handleDragProgress(goal.name, Math.min(100, goal.progress + 5))}
                  >
                    +
                  </ActionButton>
                </ProgressControls>
              </ProgressBarContainer>
            </GoalCard>
          ))}
        </GoalGrid>
      </ProgressSection>

      {showTodoModal && (
        <TodoModal>
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <ModalHeader>
              <h2>Tasks & Goals</h2>
              <CloseButton onClick={() => setShowTodoModal(false)}>×</CloseButton>
            </ModalHeader>

            <TodoInput>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              <CategorySelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Todo['category'])}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
              </CategorySelect>
              <AddButton onClick={addTodo}>Add</AddButton>
            </TodoInput>

            <TodoList>
              <Reorder.Group values={todos} onReorder={setTodos}>
                {todos.map((todo) => (
                  <Reorder.Item key={todo.id} value={todo}>
                    <TodoItem
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Checkbox
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => {
                          setTodos(todos.map(t =>
                            t.id === todo.id ? { ...t, completed: !t.completed } : t
                          ))
                        }}
                      />
                      <TodoText $completed={todo.completed}>{todo.text}</TodoText>
                      <TodoCategory>{todo.category}</TodoCategory>
                      <DeleteButton onClick={() => {
                        setTodos(todos.filter(t => t.id !== todo.id))
                      }}>×</DeleteButton>
                    </TodoItem>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </TodoList>
          </ModalContent>
        </TodoModal>
      )}
    </Container>
  )
}
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(255, 140, 105, 0.1), transparent 70%),
                radial-gradient(circle at bottom left, rgba(255, 107, 107, 0.1), transparent 70%);
    pointer-events: none;
  }
`

const Header = styled(motion.div)`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 140, 105, 0.2);
  margin-bottom: 1rem;

  h1 {
    font-size: 2.2rem;
    color: #FF8C69;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin-bottom: 0.5rem;
  }

  p {
    color: #FFA07A;
    font-size: 1rem;
    opacity: 0.8;
  }
`

const QuoteCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  margin: 1.5rem auto;
  max-width: 800px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 140, 105, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '"';
    position: absolute;
    top: 0;
    left: 20px;
    font-size: 120px;
    color: rgba(255, 140, 105, 0.1);
    font-family: Georgia, serif;
    line-height: 1;
  }
`

const Quote = styled.p`
  font-size: 1.5rem;
  line-height: 1.6;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  font-style: italic;
  text-align: center;
  padding: 0 1rem;
`

const ProgressSection = styled.section`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem 1rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 140, 105, 0.2);
  overflow: hidden;
  height: fit-content;
`

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  border-bottom: 2px solid rgba(255, 140, 105, 0.3);

  h2 {
    font-size: 1.8rem;
    color: #FF8C69;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  p {
    color: #FFA07A;
    font-size: 0.9rem;
    margin-top: 0.3rem;
    opacity: 0.8;
  }
`

const GoalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`

const GoalCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 140, 105, 0.2);
  position: relative;
`

const GoalTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #FF8C69;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 0;
    text-align: center;
  }
`

const ProgressBarContainer = styled.div`
  width: 100%;
  position: relative;
  margin-top: 1rem;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  position: relative;
  margin: 1rem 0;
  overflow: hidden;
`

const DraggableProgress = styled(motion.div)`
  height: 100%;
  background: ${props => props.color};
  border-radius: 6px;
  cursor: grab;
  transition: width 0.3s ease;

  &:active {
    cursor: grabbing;
  }
`

const ProgressLabel = styled.span`
  position: absolute;
  right: 8px;
  top: -25px;
  font-size: 0.9rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`

const ProgressControls = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 1rem;
`

const ActionButton = styled.button<ActionButtonProps>`
  background: linear-gradient(45deg, #FF8C69, #FF6B6B);
  border: none;
  padding: ${props => props.small === "true" ? '0.8rem' : '1rem 2rem'};
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  width: 35px;
  height: 35px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }
`

const StreakCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255, 140, 105, 0.2), rgba(255, 107, 107, 0.2));
  padding: 1rem;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 140, 105, 0.3);
`

const StreakCount = styled.h3`
  font-size: 1.5rem;
  color: #FF8C69;
  margin-bottom: 0.5rem;
`

const StreakMessage = styled.p`
  color: #FFA07A;
  font-size: 0.9rem;
`

const QuoteAuthor = styled.p`
  color: #FFA07A;
  font-style: italic;
  text-align: right;
  margin-top: 0.5rem;
  padding-right: 2rem;
  font-size: 1.1rem;
`

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
`

const ButtonIcon = styled.span`
  font-size: 1.2rem;
`

const StyledQuoteButton = styled.button`
  background: linear-gradient(45deg, #FF8C69, #FF6B6B);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  color: white;
  font-weight: 500;
  font-size: 1rem;
  width: 80%;
  max-width: 300px;
  margin: 1.5rem auto 0;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

const DailyTip = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.2rem;
  border-radius: 15px;
  margin: 1rem 0;
  border: 1px solid rgba(255, 140, 105, 0.2);
`

const TipTitle = styled.h3`
  color: #FF8C69;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`

const TipText = styled.p`
  color: #FFA07A;
  font-size: 0.9rem;
  line-height: 1.4;
`

const LoadingQuote = styled.div`
  color: #FFA07A;
  font-size: 1.2rem;
  margin: 2rem 0;
  text-align: center;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
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
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    font-size: 1.8rem;
    color: #FF8C69;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #FFA07A;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`

const TodoInput = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid rgba(255, 140, 105, 0.2);
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
  }
`

const CategorySelect = styled.select`
  padding: 0.5rem;
  border: 1px solid rgba(255, 140, 105, 0.2);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
`

const AddButton = styled.button`
  background: linear-gradient(45deg, #FF8C69, #FF6B6B);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  color: white;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`

const TodoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const TodoItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.01);
  }

  &:active {
    transform: scale(0.99);
  }
`

const Checkbox = styled.input`
  margin-right: 0.5rem;
`

const TodoText = styled.p<{ $completed: boolean }>`
  flex: 1;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  color: ${props => props.$completed ? '#FFA07A' : 'white'};
`

const TodoCategory = styled.p`
  color: #FFA07A;
  font-size: 0.9rem;
`

const DeleteButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #FFA07A;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`

const TasksGoalsButton = styled(motion.button)`
  background: linear-gradient(45deg, #FF8C69, #FF6B6B);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin: 2rem auto;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const ButtonText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
  
  span:first-child {
    font-weight: bold;
  }
  
  span:last-child {
    font-size: 0.9em;
  }
`

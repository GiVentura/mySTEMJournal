const today = new Date();
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = today.toLocaleDateString('en-US', options);
document.getElementById('current-date').textContent = formattedDate;


const goalForm = document.getElementById('goal-form');
const cardsContainer = document.querySelector('.cards-container');
const modalBox = document.getElementById('modalbox');
const goals = {};

goalForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('goal-title').value;
  const desc = document.getElementById('goal-desc').value;
  const color = document.querySelector('input[name="goal-color"]:checked').value;

  createGoalCard(title, desc, color);

  window.location.hash = ''; 
  goalForm.reset();
});

function createGoalCard(title, desc, color) {
  const card = document.createElement('div');
  card.classList.add('goal-card');
  card.style.backgroundColor = color;

  const goalId = Date.now(); 
  card.dataset.id = goalId;  

  card.innerHTML = `
  <h3>${title}</h3>
  <p>${desc || "No description"}</p>
  <div class="progress-bar">
    <div class="progress-fill" style="width: 0%;"></div>
  </div>
  <button class="view-btn">View</button>
`;

  cardsContainer.appendChild(card);


  goals[goalId] = { title, desc, color, tasks: [] };
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('view-btn')) {
    const card = e.target.closest('.goal-card');
    const goalId = card.dataset.id; 
    const goal = goals[goalId];

    document.getElementById('detail-title').textContent = goal.title;
    document.getElementById('detail-desc').textContent = goal.desc;
    document.querySelector('#detail-modal .modal-content').style.backgroundColor = goal.color;

    document.getElementById('detail-modal').dataset.currentGoal = goalId;

    renderTasks(goal.tasks); 
    window.location.hash = "detail-modal"; 
  }
});

function renderTasks(tasks) {
  const container = document.getElementById('todo-container');
  container.innerHTML = '';

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-item');

    taskDiv.innerHTML = `
      <span class="task-text ${task.completed ? 'task-completed' : ''}">${task.text}</span>
      <div class="task-actions">
        <button class="task-btn complete-btn">✔</button>
        <button class="task-btn delete-btn">×</button>
      </div>
    `;

    container.appendChild(taskDiv);

    taskDiv.querySelector('.complete-btn').addEventListener('click', () => {
      task.completed = !task.completed;
      renderTasks(tasks);

      const modal = document.getElementById('detail-modal');
      const goalId = modal.dataset.currentGoal;
      const goalCard = document.querySelector(`.goal-card[data-id='${goalId}']`);

      updateGoalProgress(goalId);

      if (tasks.some(t => t.completed)) {
        document.querySelector('.in-process').appendChild(goalCard);
      } else {
        document.querySelector('.to-do .cards-container').appendChild(goalCard);
      }
    });

    taskDiv.querySelector('.delete-btn').addEventListener('click', () => {
      tasks.splice(index, 1);
      renderTasks(tasks);
    });
  });
}

const goalCompleteBtn = document.createElement('button');
goalCompleteBtn.textContent = "This goal has been reached!";
goalCompleteBtn.id = "goal-complete-btn";
goalCompleteBtn.style.marginTop = "10px";
document.querySelector('#detail-modal .modal-content').appendChild(goalCompleteBtn);

goalCompleteBtn.addEventListener('click', () => {
  const modal = document.getElementById('detail-modal');
  const goalId = modal.dataset.currentGoal;
  const goalCard = document.querySelector(`.goal-card[data-id='${goalId}']`);
  document.querySelector('.ready').appendChild(goalCard);
  window.location.hash = ''; // Cierra modal
});


document.getElementById('add-task-btn').addEventListener('click', () => {
  const input = document.getElementById('new-task-input');
  const text = input.value.trim();
  if (!text) return; 

  const modal = document.getElementById('detail-modal');
  const goalId = modal.dataset.currentGoal;
  const goal = goals[goalId];

  goal.tasks.push({ text, completed: false }); 
  renderTasks(goal.tasks); 
  updateGoalProgress(goalId);
  input.value = ''; 
});

const searchInput = document.querySelector('.search input');
const searchBtn = document.querySelector('.search-btn');

searchInput.addEventListener('input', () => {
  if (searchInput.value.trim() === '') {
    document.querySelectorAll('.goal-card').forEach(card => card.style.display = 'block');
  }
});

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  const allCards = document.querySelectorAll('.goal-card');

  allCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    if (title.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

function updateGoalProgress(goalId) {
  const goal = goals[goalId];
  const card = document.querySelector(`.goal-card[data-id='${goalId}']`);
  const progressFill = card.querySelector('.progress-fill');

  const totalTasks = goal.tasks.length;
  const completedTasks = goal.tasks.filter(t => t.completed).length;

  const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  progressFill.style.width = percent + '%';
}
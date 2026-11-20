// адреса API, к которым будут обращаться запросы
const usersUrl = 'https://jsonplaceholder.typicode.com/users';
const postsUrl = 'https://jsonplaceholder.typicode.com/posts';
// поиск элементов по id
const usersList = document.querySelector('#users-list');
const publicationsList = document.querySelector('#publications-list');
const loadUsersButton = document.querySelector('#load-users-button');
const searchInput = document.querySelector('#search-input');
const messages = document.querySelector('#messages');

// массив загруженных пользователей
let users = [];
// выполняется ли сейчас запрос
let isLoading = false;

// вывод сообщений
function showMessage(text, type = '') {
    messages.textContent = text;
    messages.className = `messages ${type}`.trim();
}

// функция состояний: включение/отключение кнопок в зависимости от состояния загрузки
function setLoading(loading) {
    isLoading = loading;
    loadUsersButton.disabled = loading;
    usersList.querySelectorAll('button').forEach((button) => {
        button.disabled = loading;
    });
}

// создание карточки пользователя
function createUserCard(user) {
    const card = document.createElement('article');
    card.className = 'user-card';

    const name = document.createElement('h3');
    name.textContent = user.name;

    const details = document.createElement('p');
    details.className = 'user-details';
    details.textContent = `Email: ${user.email} · Город: ${user.address.city}`;

    const button = document.createElement('button');
    button.className = 'button button-create';
    button.type = 'button';
    button.textContent = 'Показать публикации';
    button.disabled = isLoading;

    button.addEventListener('click', () => loadUserPosts(user));

    card.append(name, details, button);
    return card;
}

// видимость карточек на странице
function renderUsers() {
    // фильтрация по запросу без учета регистра
    const searchText = searchInput.value.trim().toLowerCase();
    const matchingUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchText)
    );

    // очищение старых карточек на странице
    usersList.replaceChildren();

    // если совпадений нет
    if (matchingUsers.length === 0) {
        const message = document.createElement('p');
        message.className = 'empty-state';
        message.textContent = searchText
            ? 'Пользователи не найдены'
            : 'Список пользователей пуст.';
        usersList.append(message);
        return;
    }

    // если совпадения найдены, для каждого создается и отображается карточка
    matchingUsers.forEach((user) => {
        usersList.append(createUserCard(user));
    });
}

// создание карточки публикации
function createPublicationCard(post) {
    const card = document.createElement('article');
    card.className = 'publication-card';

    const title = document.createElement('h3');
    title.textContent = post.title;

    const body = document.createElement('p');
    body.textContent = post.body;

    card.append(title, body);
    return card;
}

// загрузка пользователей
loadUsersButton.addEventListener('click', async () => {
    setLoading(true);
    showMessage('Загрузка...');

    try {
        const response = await fetch(usersUrl);

        if (!response.ok) {
            throw new Error(`Не удалось загрузить пользователей. Ошибка HTTP: ${response.status}.`);
        }

        users = await response.json();
        renderUsers();
        showMessage(`Загружено пользователей: ${users.length}.`, 'success');
    } catch (error) {
        showMessage(`Ошибка загрузки пользователей: ${error.message} Проверьте соединение и попробуйте снова.`, 'error');
    } finally {
        setLoading(false);
    }
});

// обработчик поиска: при вводе, удалении или изменении текста в поле поиска
searchInput.addEventListener('input', renderUsers);

// загрузка публикаций выбранного пользователя
async function loadUserPosts(user) {
    setLoading(true);
    publicationsList.replaceChildren();

    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'empty-state';
    loadingMessage.textContent = 'Загрузка...';
    publicationsList.append(loadingMessage);
    showMessage('Загрузка...');

    try {
        const response = await fetch(`${postsUrl}?userId=${user.id}`);

        if (!response.ok) {
            throw new Error(`Не удалось загрузить публикации. Ошибка HTTP: ${response.status}.`);
        }

        const posts = await response.json();
        const firstPosts = posts.slice(0, 3);
        // превращение каждой публикации в карточку
        publicationsList.replaceChildren(
            ...firstPosts.map((post) => createPublicationCard(post))
        );
        showMessage(`Показаны публикации пользователя ${user.name}.`, 'success');
    } catch (error) {
        publicationsList.replaceChildren();
        showMessage(`Ошибка загрузки публикаций: ${error.message} Попробуйте снова.`, 'error');
    } finally {
        setLoading(false);
    }
}

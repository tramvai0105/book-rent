export const isAuthenticatedAndVerified = (req, res, next) => {
    if (!req.user || !req.user.verificated) {
        return res.status(403).send('Доступ запрещен: вы не авторизованы или не верифицированы');
    }
    next();
};

export const isModerator = (req, res, next) => {
    // Проверяем, есть ли пользователь в сессии
    if (req.isAuthenticated() && req.user) {
        // Проверяем роль пользователя
        if (req.user.role === 'moderator') {
            return next(); // Если роль модератора, продолжаем
        } else {
            return res.status(403).json({ message: 'Доступ запрещен: требуется роль модератора.' });
        }
    } else {
        return res.status(401).json({ message: 'Пользователь не аутентифицирован.' });
    }
};

export const checkPermissions = (req, res, next) => {
    if(!req.isAuthenticated() && req.user){
        return res.status(401).json({ message: 'Пользователь не аутентифицирован.' });
    }
    const userId = req.user.id; // ID текущего пользователя
    const isAdmin = req.user.role === 'moderator'; // Проверка, является ли пользователь администратором

    // Проверка, является ли пользователь администратором или владельцем книги
    if (isAdmin || req.params.id === userId.toString()) {
        return next(); // Доступ разрешен
    } else {
        return res.status(403).json({ message: 'Доступ запрещен.' });
    }
};
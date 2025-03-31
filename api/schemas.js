import Joi from "joi"

// Схема для добавления книги с кастомизированными сообщениями об ошибках
export const bookSchema = Joi.object({
    title: Joi.string()
        .min(4)
        .required()
        .messages({
            'string.base': 'Название должно быть строкой.',
            'string.empty': 'Название не может быть пустым.',
            'string.min': 'Название должно содержать как минимум 4 символа.',
            'any.required': 'Название обязательно для заполнения.'
        }),
    author: Joi.string()
        .min(4)
        .required()
        .messages({
            'string.base': 'Автор должен быть строкой.',
            'string.empty': 'Автор не может быть пустым.',
            'string.min': 'Автор должен содержать как минимум 4 символа.',
            'any.required': 'Автор обязателен для заполнения.'
        }),
    publicationYear: Joi.number()
        .optional()
        .messages({
            'number.base': 'Год публикации должен быть числом.'
        }),
    genre: Joi.string()
        .min(4)
        .required()
        .messages({
            'string.base': 'Жанр должен быть строкой.',
            'string.empty': 'Жанр не может быть пустым.',
            'string.min': 'Жанр должен содержать как минимум 4 символа.',
            'any.required': 'Жанр обязателен для заполнения.'
        }),
    address: Joi.string()
        .min(4)
        .required()
        .messages({
            'string.base': 'Адрес должен быть строкой.',
            'string.empty': 'Адрес не может быть пустым.',
            'string.min': 'Адрес должен содержать как минимум 4 символа.',
            'any.required': 'Адрес обязателен для заполнения.'
        }),
    photos: Joi.string().optional(),
    listingId: Joi.string().optional(),
    phoneNumber: Joi.string()
        .optional()
        .messages({
            'string.base': 'Номер телефона должен быть строкой.'
        }),
    description: Joi.string()
        .max(500)
        .optional()
        .messages({
            'string.base': 'Описание должно быть строкой.',
            'string.max': 'Описание не может превышать 500 символов.'
        }),
    wealth: Joi.string()
        .max(500)
        .optional()
        .messages({
            'string.base': 'Состояние должно быть строкой.',
            'string.max': 'Состояние не может превышать 500 символов.'
        }),
    interactionType: Joi.string()
        .valid('rent', 'sale', 'both')
        .required()
        .messages({
            'string.base': 'Тип взаимодействия должен быть строкой.',
            'any.only': 'Тип взаимодействия должен быть одним из: rent, sale, both.',
            'any.required': 'Тип взаимодействия обязателен для заполнения.'
        }),
    rentPricePerMonth: Joi.number()
        .optional()
        .messages({
            'number.base': 'Цена аренды должна быть числом.'
        }),
    deposit: Joi.number()
        .optional()
        .messages({
            'number.base': 'Депозит должен быть числом.'
        }),
    salePrice: Joi.number()
        .optional()
        .messages({
            'number.base': 'Цена продажи должна быть числом.'
        }),
    city: Joi.string()
        .min(4)
        .required()
        .messages({
            'string.base': 'Город должен быть строкой.',
            'string.empty': 'Город не может быть пустым.',
            'string.min': 'Город должен содержать как минимум 4 символа.',
            'any.required': 'Город обязателен для заполнения.'
        })
});

export function isValidPhoneNumber(phoneNumber) {
    // Регулярное выражение для проверки формата номера телефона
    const phoneRegex = /^\+?\d{1,3}[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

    return phoneRegex.test(phoneNumber);
}

// Схема валидации с использованием Joi
export const registrationSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email должен быть строкой',
            'string.email': 'Некорректный адрес электронной почты',
            'any.required': 'Email обязателен'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.base': 'Пароль должен быть строкой',
            'string.min': 'Пароль должен содержать не менее 6 символов',
            'any.required': 'Пароль обязателен'
        }),
    contactInfo: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.base': 'Контактная информация должна быть строкой',
            'string.min': 'Контактная информация обязательна',
            'any.required': 'Контактная информация обязательна'
        }),
    city: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.base': 'Город должен быть строкой',
            'string.min': 'Город обязателен',
            'any.required': 'Город обязателен'
        }),
});
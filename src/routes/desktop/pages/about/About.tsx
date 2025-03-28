import React from 'react'

export default function About() {
    return (
        <div className='w-full h-fit px-[3%]'>
            <div className='flex text-xl bg-main rounded-md w-full h-fit p-8 pb-20 gap-4 flex-col'>
                <h1 className='font-bold'>О платформе</h1>
                <span className='whitespace-pre'>{`LitFond – это онлайн-платформа для аренды и продажи классической учебной литературы. 
Мы помогаем студентам, преподавателям и книголюбам обмениваться бумажными книгами, 
упрощая процесс аренды и покупки. Здесь можно найти редкие издания, сдать в 
аренду ненужные книги или приобрести необходимые учебники.`}</span>
                <h1 className='font-bold'>Политика конфиденциальности</h1>
                <span className='whitespace-pre'>{`Мы уважаем вашу конфиденциальность и защищаем персональные данные пользователей. 
Сервис хранит только необходимую информацию для работы платформы (e-mail, имя, город, 
контакты для связи). Мы не передаем личные данные третьим лицам без согласия 
пользователя, за исключением случаев, предусмотренных законом.`}</span>
                <h1 className='font-bold'>О платформе</h1>
                <ul className='list-decimal pl-6'>
                    <li>
                        Регистрация и аккаунт
                        <ul className='list-disc pl-6'>
                            <li>Пользователь обязан предоставить актуальную информацию при регистрации.</li>
                            <li>Администрация оставляет за собой право блокировать учетные записи при нарушении правил.</li>
                        </ul>
                    </li>
                    <li>
                        Размещение объявлений
                        <ul className='list-disc pl-6'>
                            <li>Все объявления проходят модерацию перед публикацией.</li>
                            <li>Запрещено размещать ложную информацию о книгах.</li>
                        </ul>
                    </li>
                    <li>
                        Аренда и продажа
                        <ul className='list-disc pl-6'>
                            <li>Взаимодействие между пользователями происходит напрямую.</li>
                            <li>Сервис не несет ответственности за нарушения со стороны пользователей.</li>
                        </ul>
                    </li>
                    <li>
                        Штрафы и нарушения
                        <ul className='list-disc pl-6'>
                            <li>В случае несвоевременного возврата книги арендатору может быть назначен штраф.</li>
                            <li>Модераторы вправе принимать меры в случае возникновения спорных ситуаций.</li>
                        </ul>
                    </li>
                </ul>
                <h1 className='font-bold'>Контакты</h1>
                <span className='whitespace-pre'>{`Если у вас есть вопросы или нужна помощь, свяжитесь с нами:
Email: 1809sy@gmail.com`}</span>
            </div>
        </div>
    )
}

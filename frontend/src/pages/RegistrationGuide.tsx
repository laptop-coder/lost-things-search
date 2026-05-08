import { A } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { ROLES } from "../lib/permissions";
import { useParams } from "@solidjs/router";

const RegistrationGuide = () => {
  const params = useParams();
  const role = params.role;
  const [error, setError] = createSignal("");
  if (role !== ROLES.STUDENT && role !== ROLES.PARENT) {
    setError("Недействительная ссылка");
  }
  return (
    <div class="max-w-5xl mx-auto px-4 py-8 md:py-16 space-y-12">
      <div class="text-center space-y-4">
        <h1 class="text-3xl md:text-5xl font-bold text-gray-800">Инструкция</h1>
        <p class="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
          Создание учётной записи {role === ROLES.STUDENT ? "ученика" : ""}
          {role === ROLES.PARENT ? "родителя" : ""}
        </p>
      </div>

      <Show when={role === ROLES.STUDENT}>
        <div>
          <ol>
            <li>
              1. Перейдите на главную страницу и нажмите на кнопку{" "}
              <A
                href="/login"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                Войти
              </A>
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/01-login-button.png"
                alt="Кнопка входа в учётную запись"
              />
            </div>
            <li>
              2. Нажмите{" "}
              <A
                href="/register"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                Запросить пригласительную ссылку
              </A>
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/02-link-to-invite-request-form.png"
                alt="Кнопка запроса пригласительной ссылки"
              />
            </div>
            <li>3. Выберите роль ученика</li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/03-student-role.png"
                alt="Кнопка выбора роли ученика"
              />
            </div>
            <li>4. Введите email</li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/04-student-input-email.png"
                alt="Поле ввода email ученика"
              />
            </div>
            <li>
              5. На почту придёт письмо со ссылкой для создания учётной записи
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/05-student-email-was-sent.png"
                alt="Письмо было отправлено на электронную почту"
              />
            </div>
            Если письмо не пришло, проверьте папку "Спам".
            <li>6. Нажмите на кнопку в письме</li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/09-register-button-in-email.png"
                alt="Кнопка в письме для создания учётной записи"
              />
            </div>
            Ссылка действительна в течение одной недели. Если время истекло или
            ссылка некорректна, вы увидите ошибку. Если это произошло, вернитесь
            к п.1 и начните сначала.
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/10-invalid-token.png"
                alt="Ошибка: ссылка недействительна"
              />
            </div>
            <li>
              7. Заполните форму. Автоматически подставляется электронная почта,
              указанная при запросе пригласительной ссылки
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/11-student-register-form.png"
                alt="Форма создания учётной записи ученика"
              />
            </div>
            <li>
              8. Вы будете перенаправлены на главную страницу. Учётная запись
              ученика создана!
            </li>
          </ol>
        </div>
      </Show>

      <Show when={role === ROLES.PARENT}>
        <div>
          <ol>
            <li>
              1. Перейдите на главную страницу и нажмите на кнопку{" "}
              <A
                href="/login"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                Войти
              </A>
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/01-login-button.png"
                alt="Кнопка входа в учётную запись"
              />
            </div>
            <li>
              2. Нажмите{" "}
              <A
                href="/register"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                Запросить пригласительную ссылку
              </A>
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/02-link-to-invite-request-form.png"
                alt="Кнопка запроса пригласительной ссылки"
              />
            </div>
            <li>3. Выберите роль родителя</li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/06-parent-role.png"
                alt="Кнопка выбора роли родителя"
              />
            </div>
            <li>4. Введите email</li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/07-parent-input-email.png"
                alt="Поле ввода email родителя"
              />
            </div>
            <li>
              5. На почту придёт письмо со ссылкой для создания учётной записи
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/08-parent-email-was-sent.png"
                alt="Письмо было отправлено на электронную почту"
              />
            </div>
            Если письмо не пришло, проверьте папку "Спам".
            <li>6. Нажмите на кнопку в письме</li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/09-register-button-in-email.png"
                alt="Кнопка в письме для создания учётной записи"
              />
            </div>
            Ссылка действительна в течение одной недели. Если время истекло или
            ссылка некорректна, вы увидите ошибку. Если это произошло, вернитесь
            к п.1 и начните сначала.
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/10-invalid-token.png"
                alt="Ошибка: ссылка недействительна"
              />
            </div>
            <li>
              7. Заполните форму. Автоматически подставляется электронная почта,
              указанная при запросе пригласительной ссылки
            </li>
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/12-parent-register-form.png"
                alt="Форма создания учётной записи родителя"
              />
            </div>
            Обратите внимание на возможность привязки учётных записей детей. Для
            привязки учётной записи введите её ID в специальное поле. ID можно
            скопировать из личного кабинета ребёнка.
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/14-student-profile.png"
                alt="Личный кабинет ребёнка"
              />
            </div>
            Это также можно сделать позднее. Более подробная информация о том,
            как привязать учётную запись ребёнка, направляется на email вместе с
            пригласительной ссылкой.
            <div class="flex justify-center w-full my-5">
              <img
                src="/storage/assets/registration_guide/13-assign-student-to-parent-guide.png"
                alt="Инструкция по привязке учётной записи ребёнка"
              />
            </div>
            <li>
              8. Вы будете перенаправлены на главную страницу. Учётная запись
              родителя создана!
            </li>
          </ol>
        </div>
      </Show>

      <Show when={error()}>
        <div class="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200">
          {error()}
        </div>
      </Show>
    </div>
  );
};

export default RegistrationGuide;

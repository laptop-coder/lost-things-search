import { A } from "@solidjs/router";
import { Show } from "solid-js";
import {
  Search,
  MessageCircleQuestionMark,
  MessageSquareText,
  Shield,
  GraduationCap,
  BookOpen,
  Users,
  Building2,
  UserCog,
} from "lucide-solid";
import { useAuth } from "../lib/auth";

const About = () => {
  const auth = useAuth();
  return (
    <div class="bg-bg max-w-5xl mx-auto px-4 py-8 md:py-16 space-y-12">
      <div class="text-center space-y-4">
        <h1 class="text-3xl md:text-5xl font-bold text-text">
          LostThingsSearch
        </h1>
        <p class="text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
          Сервис поиска потерянных вещей для образовательных учреждений
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-text mb-2 flex gap-1">
            <Search /> Нашли что-то чужое?
          </h2>
          <p class="text-text text-sm">
            Сфотографируйте находку и создайте объявление. Укажите, где и когда
            вы её нашли, чтобы владелец мог быстро найти свою вещь.
          </p>
        </div>
        <div class="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-text mb-2 flex gap-1">
            <MessageCircleQuestionMark /> Потеряли своё?
          </h2>
          <p class="text-text text-sm">
            Проверьте ленту объявлений — возможно, кто-то уже ищет хозяина вашей
            вещи. Используйте фильтры, чтобы ускорить поиск.
          </p>
        </div>
        <div class="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-text mb-2 flex gap-1">
            <MessageSquareText /> Свяжитесь с автором
          </h2>
          <p class="text-text text-sm">
            Напишите автору объявления через встроенные сообщения, чтобы
            договориться о возврате, не раскрывая личных контактов.
          </p>
        </div>
        <div class="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-text mb-2 flex gap-1">
            <Shield /> Безопасность
          </h2>
          <p class="text-text text-sm">
            Все объявления проверяются администраторами сервиса.
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-text text-center">
          Для кого этот сервис
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="bg-surface rounded-2xl p-4 shadow-sm text-center">
            <GraduationCap class="text-3xl mb-2 inline-flex text-text" />
            <h3 class="font-semibold text-text">Ученики</h3>
          </div>
          <div class="bg-surface rounded-2xl p-4 shadow-sm text-center">
            <BookOpen class="text-3xl mb-2 inline-flex text-text" />
            <h3 class="font-semibold text-text">Учителя</h3>
          </div>
          <div class="bg-surface rounded-2xl p-4 shadow-sm text-center">
            <Users class="text-3xl mb-2 inline-flex text-text" />
            <h3 class="font-semibold text-text">Родители</h3>
          </div>
          <div class="bg-surface rounded-2xl p-4 shadow-sm text-center">
            <UserCog class="text-3xl mb-2 inline-flex text-text" />
            <h3 class="font-semibold text-text">Сотрудники</h3>
          </div>
          <div class="bg-surface rounded-2xl p-4 shadow-sm text-center">
            <Building2 class="text-3xl mb-2 inline-flex text-text" />
            <h3 class="font-semibold text-text">Администрация</h3>
          </div>
        </div>
      </div>

      <Show when={!auth.user()}>
        <div class="flex flex-col justify-center items-center space-y-4 bg-surface rounded-2xl p-8 shadow-sm">
          <h2 class="text-2xl font-bold text-text">Присоединяйтесь!</h2>
          <A
            href="/register"
            class="px-5 h-10 bg-accent hover:bg-accent-hover text-bg rounded-xl transition font-medium inline-flex items-center justify-center text-nowrap"
          >
            Создать учётную запись
          </A>
        </div>
      </Show>
    </div>
  );
};

export default About;

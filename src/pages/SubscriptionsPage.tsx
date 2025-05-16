
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/context/AppContext";

const SubscriptionsPage = () => {
  const { subscriptions } = useApp();
  
  return (
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold">Абонементы</h1>
        <p className="mt-4 text-gray-600">
          Выберите подходящий абонемент для вашего фитнес-путешествия. Все тарифы дают вам
          неограниченный доступ ко всем локациям партнеров GoodFit.
        </p>
      </div>
      
      <div className="grid gap-6 mb-16 md:grid-cols-2 lg:grid-cols-4">
        {subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-6 text-2xl font-bold">Преимущества абонементов</h2>
        
        <Tabs defaultValue="all_plans">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all_plans">Все тарифы</TabsTrigger>
            <TabsTrigger value="monthly">Месячный</TabsTrigger>
            <TabsTrigger value="quarterly">Квартальный</TabsTrigger>
            <TabsTrigger value="annual">Годовой</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all_plans" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Основные преимущества</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Доступ ко всем партнерским залам и студиям</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Неограниченное количество бронирований занятий</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Без долгосрочных обязательств</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Мобильное приложение для бронирования и регистрации</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Ограничения</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-red-400 rounded-full"></div>
                    <span>Максимум 1 визит в день на одну локацию</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-red-400 rounded-full"></div>
                    <span>Некоторые премиум-занятия могут иметь дополнительную плату</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-red-400 rounded-full"></div>
                    <span>Бронирование занятий открывается за 24 часа</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Преимущества месячного тарифа</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Все основные преимущества</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Идеален для ознакомления с сервисом</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Можно отменить в любое время</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Подходит для</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Новичков, впервые пробующих GoodFit</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Людей с меняющимся расписанием</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Тех, кто предпочитает гибкость</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quarterly" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Преимущества квартального тарифа</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Все преимущества месячного тарифа</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Экономия 16% по сравнению с месячным планом</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Приоритетное окно бронирования (за 48 часов)</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Подходит для</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Любителей регулярных тренировок</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Тех, кто хочет сэкономить</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Людей, ценящих возможность бронировать популярные занятия</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="annual" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Преимущества годового тарифа</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Все преимущества квартального тарифа</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Экономия 28% по сравнению с месячным планом</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Бесплатный гостевой проход каждый месяц</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Бесплатная фитнес-консультация</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Приоритетное бронирование (за 72 часа)</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Подходит для</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Преданных фитнес-энтузиастов</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Тех, кто ищет максимальную выгоду</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Людей, которые хотят иногда приводить друзей</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="mb-6 text-2xl font-bold">Часто задаваемые вопросы</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Сколько раз в день я могу посещать зал?</AccordionTrigger>
            <AccordionContent>
              Вы можете посещать каждую партнерскую локацию один раз в день. Однако вы можете посетить несколько разных локаций в один и тот же день.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Могу ли я отменить подписку в любое время?</AccordionTrigger>
            <AccordionContent>
              Да, вы можете отменить подписку в любое время. Для месячных тарифов нет обязательств. Для квартальных и годовых тарифов вы также можете отменить подписку, но возврат средств за неиспользованную часть не предусмотрен.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>Как забронировать занятие?</AccordionTrigger>
            <AccordionContent>
              Вы можете бронировать занятия через наше мобильное приложение или веб-сайт. Просто просмотрите расписание вашего предпочтительного зала, выберите занятие и нажмите "Забронировать". Вы можете бронировать занятия за 24-72 часа в зависимости от типа вашего абонемента.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>Что происходит, если я пропущу забронированное занятие?</AccordionTrigger>
            <AccordionContent>
              Если вы не можете посетить занятие, пожалуйста, отмените бронирование не менее чем за 2 часа до начала занятия. Повторные неявки могут привести к ограничениям на бронирование.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>Предлагаете ли вы корпоративные абонементы?</AccordionTrigger>
            <AccordionContent>
              Да, мы предлагаем специальные корпоративные тарифы для компаний. Пожалуйста, свяжитесь с нашей командой корпоративных продаж по адресу corporate@goodfit.com для получения дополнительной информации.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SubscriptionsPage;

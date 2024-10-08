import jdatetime
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.views.generic import CreateView, ListView, UpdateView, DeleteView
from .models import Exam
from questions import models
from course.models import Course
from .forms import ExamForm, ExamFormUpdate
import json
from django.http import JsonResponse
from decimal import Decimal
import random
from decorator import access_level_required
from user.models import STUDENT_ACCESS, ADMIN_ACCESS


class ExamListView(ListView):
    model = Exam
    template_name = 'home/exams.html'
    context_object_name = 'exams'

    def get_queryset(self):
        # Get the 'id' parameter from the URL
        course_id = self.kwargs['id']

        # Filter the exams by 'id' if it's provided in the URL parameter
        if course_id:
            return Exam.objects.filter(course__pk=course_id)

        # If 'id' is not provided in the URL, return all exams
        return Exam.objects.all()

    @access_level_required(ADMIN_ACCESS)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        exams = self.get_queryset()

        exams_data = [{
            'id': exam.id,
            'course_id': exam.course_id,
            'label': exam.label,
            'score_type': exam.score_type,
            'unanswered_penalty': exam.unanswered_penalty,
            'shuffle_answer': exam.shuffle_answer,
            'incorrect_penalty': exam.incorrect_penalty,
            'percent_passing_score': exam.percent_passing_score,
            'point_passing_score': exam.point_passing_score,
            'duration': exam.duration,
            'exam_date': exam.exam_date,
            'exam_time': exam.exam_time,
            'deadline': exam.deadline,
            'choose_manual': exam.manual_chosen,
            'q_bank': [
                {'id': q.question_group.id, 'q_id': q.id}  # Include 'name' and other properties
                for q in exam.questions.all()
            ]
        } for exam in exams]

        exams_json = json.dumps(exams_data, cls=DecimalEncoder, indent=4, sort_keys=True, default=str)
        context['exams_json'] = exams_json
        course = Course.objects.get(id=self.kwargs['id'])

        if course.question_bank:
            context['q_bank'] = [
                {'id': q.id, 'name': q.name, 'number': q.question_group_questions.count(), 'group': q}
                for q in course.question_bank.q_bank_q_groups.all()
            ]
        else:
            context['q_bank'] = []
        return context


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)


class StudentExamListView(ListView):
    model = Exam
    template_name = 'home/student-exams.html'
    context_object_name = 'exams'

    @access_level_required(STUDENT_ACCESS)
    def get_queryset(self):
        # Return only exams where action is True
        user_id = self.request.user.id
        print(datetime.now())

        x = jdatetime.date.fromgregorian(date=datetime.now())
        # t = datetime.datetime(2012, 2, 23, 0, 0)
        y = x.strftime('%m/%d/%Y')
        print(y[4:])
        print(y[:5])
        z = y[4:] + '/' + y[:5]
        print(z)
        print(z[2:])
        print('yyyyyyyyyyyyy')

        return Exam.objects.filter(course__students=user_id, exam_date=z[2:])


class StudentExamHistoryListView(ListView):
    model = Exam
    template_name = 'home/student-exams-history.html'
    context_object_name = 'exams'

    @access_level_required(STUDENT_ACCESS)
    def get_queryset(self):
        # Return only exams where action is True
        user_id = self.request.user.id

        return Exam.objects.filter(course__students=user_id, exam_status='E')


class ExamCreateView(CreateView):
    model = Exam
    form_class = ExamForm
    template_name = 'home/exams.html'
    success_url = '/success/'

    def form_invalid(self, form):
        print('invalid submit')
        errors = form.errors.as_json()
        return JsonResponse({'errors': errors}, status=400)

    @access_level_required(ADMIN_ACCESS)
    def form_valid(self, form):
        selected_groups_id = self.request.POST.getlist('selected_groups_id[]')
        q_choose_checkbox = self.request.POST.getlist('q-choose-checkbox[]')

        selected_groups_num = self.request.POST.getlist('selected_groups_num[]')
        q_list = []
        group_num = 0

        if self.request.POST.get('manual_chosen') == 'true':

            questions = models.Question.objects.filter(id__in=q_choose_checkbox)
            q_list.extend(questions)
        else:

            for group_id in selected_groups_id:
                questions = models.QuestionGroup.objects.get(id=group_id).question_group_questions.all()

                sampled_questions = random.sample(list(questions),
                                                  min(int(selected_groups_num[group_num]), len(questions)))

                q_list.extend(sampled_questions)

                group_num = group_num + 1
        total_score = sum(question.score for question in q_list)

        course = get_object_or_404(Course, id=self.kwargs['id'])
        exam = form.save(commit=False)
        exam.score = total_score
        exam.course = course
        exam.save()

        exam.questions.set(q_list)
        return JsonResponse({}, status=200)


class ExamUpdateView(UpdateView):
    model = Exam
    form_class = ExamFormUpdate
    template_name = 'home/exams.html'
    success_url = '/success/'

    @access_level_required(ADMIN_ACCESS)
    def form_valid(self, form):
        exam = form.save(commit=False)
        selected_groups_id = self.request.POST.getlist('selected_groups_id[]')
        selected_groups_num = self.request.POST.getlist('selected_groups_num[]')
        q_choose_checkbox = self.request.POST.getlist('q-choose-checkbox[]')
        q_list = []
        group_num = 0
        if self.request.POST.get('manual_chosen') == 'true':
            questions = models.Question.objects.filter(id__in=q_choose_checkbox)
            q_list.extend(questions)
        else:
            for group_id in selected_groups_id:
                questions = models.QuestionGroup.objects.get(id=group_id).question_group_questions.all()
                sampled_questions = random.sample(list(questions),
                                                  min(int(selected_groups_num[group_num]), len(questions)))

                q_list.extend(sampled_questions)

                group_num = group_num + 1
        exam.questions.clear()
        total_score = sum(question.score for question in q_list)
        exam.score = total_score

        exam.questions.set(q_list)
        exam.save()

        return JsonResponse({}, status=200)


class ExamDelete(DeleteView):
    model = Exam
    template_name = 'home/exams.html'
    success_url = '/success/'

    @access_level_required(ADMIN_ACCESS)
    def form_valid(self, form):
        self.object = self.get_object()
        self.object.delete()

        return JsonResponse({}, status=200)


class ActiveExam(UpdateView):
    model = Exam
    fields = ['id', ]
    template_name = 'home/exams.html'
    success_url = '/success/'

    @access_level_required(ADMIN_ACCESS)
    def form_valid(self, form):
        self.object = self.get_object()
        self.object.action = True
        current_time = datetime.now().strftime("%Y-%m-%d")
        self.object.active_time = current_time
        self.object.exam_status = 'A'
        self.object.save()

        return JsonResponse({}, status=200)

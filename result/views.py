from django.shortcuts import render
from .models import Result
from django.views.generic import  ListView

# Create your views here.

class ResultListView(ListView):
    model = Result
    template_name = 'home/results.html'
    context_object_name = 'results'

    def get_queryset(self):
        # Get the 'id' parameter from the URL
        exam_id = self.kwargs['id']

        # Filter the exams by 'id' if it's provided in the URL parameter
        if exam_id:
            return Result.objects.filter(exam__pk=exam_id)

        # If 'id' is not provided in the URL, return all exam
        # TODO


        return Result.objects.all()


from django.shortcuts import render


def index(request):
    return render(request, 'devportal/index.html')

from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404
from .models import Developer, Project
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt  # TODO remove
from django.db import IntegrityError
import json
import logging


@method_decorator(csrf_exempt, name='dispatch')  # TODO remove
class DeveloperView(View):
    def get(self, request):
        developers = Developer.objects.all()  # get all developer data
        developers_serialised_data = []  # store serialised dev data
        for developer in developers:  # serialise data
            developers_serialised_data.append({
                'id': developer.pk,
                'name': developer.name,
                'bio': developer.bio,
                'price': developer.price,
            })

        data = {
            'developers': developers_serialised_data
        }
        return JsonResponse(data)

    def post(self, request):
        try:
            body = json.loads(request.body)  # load req body
            d = Developer(  # create developer object
                name=body.get('name'),
                bio=body.get('bio'),
                price=body.get('price')
            )
            d.save()  # save object
            return JsonResponse({"message": "Developer added"}, status=201)

        except TypeError as ex:
            return JsonResponse({"message": "Developer not added"}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class DeveloperUpdateDeleteView(View):
    def put(self, request, developer_id):
        try:
            d = get_object_or_404(Developer,  pk=developer_id)
            body = json.loads(request.body)
            d.name = body.get('name')
            d.bio = body.get('bio')
            d.price = body.get('price')
            d.save()
            return JsonResponse({"message": "Developer updated"})

        except TypeError as ex:
            return JsonResponse({"message": "Project not updated"}, status=400)

    def delete(self, request, developer_id):
        d = get_object_or_404(Developer, pk=developer_id)
        d.delete()
        return JsonResponse({"message": "Developer deleted"})


@method_decorator(csrf_exempt, name='dispatch')  # TODO remove
class ProjectView(View):
    def get(self, request):
        projects = Project.objects.all()
        projects_serialised_data = []  # store serialised project data
        for project in projects:  # serialise data
            project_developers = []  # store serialised dev data
            for developer in project.developers.all():  # serialise dev data
                project_developers.append({
                    'id': developer.pk,
                    'name': developer.name,
                    'bio': developer.bio,
                    'price': developer.price,
                })
            projects_serialised_data.append({
                'id': project.pk,
                'title': project.title,
                'developers': project_developers,
                'budget': project.budget,
            })

        data = {
            'projects': projects_serialised_data
        }
        return JsonResponse(data)

    def post(self, request):
        try:
            body = json.loads(request.body)  # load req body
            p = Project(  # create project object
                title=body.get('title'),
                budget=body.get('budget')
            )
            p.save()  # save obj
            for developer in body.get('developers'):  # add developers to object
                p.developers.add(developer)
            p.save()  # save obj
            return JsonResponse({"message": "Project added"}, status=201)

        except TypeError as ex:  # catch if developers object is wrong
            return JsonResponse({"message": "Developers not added"}, status=400)
        except IntegrityError as ex:
            return JsonResponse({"message": "Developer not added, developer does not exist"}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class ProjectUpdateDeleteView(View):
    def put(self, request, project_id):
        try:
            p = get_object_or_404(Project, pk=project_id)
            body = json.loads(request.body)
            p.title = body.get('title')
            p.developers.set(body.get('developers'))
            p.budget = body.get('budget')
            p.save()
            return JsonResponse({"message": "Project updated"})

        except TypeError as ex:
            return JsonResponse({"message": "Project not updated"}, status=400)
        except IntegrityError as ex:
            return JsonResponse({"message": "Project not updated, developer does not exist"}, status=400)

    def delete(self, request, project_id):
        p = get_object_or_404(Project, pk=project_id)
        p.delete()
        return JsonResponse({"message": "project deleted"})

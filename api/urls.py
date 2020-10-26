from django.urls import path

from .views import DeveloperView, ProjectView, DeveloperUpdateDeleteView, ProjectUpdateDeleteView

app_name = 'api'
urlpatterns = [
    path('developers/', DeveloperView.as_view()),
    path("developers/<int:developer_id>/", DeveloperUpdateDeleteView.as_view()),
    path('projects/', ProjectView.as_view()),
    path("projects/<int:project_id>/", ProjectUpdateDeleteView.as_view()),
]

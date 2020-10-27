from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('api/', include('api.urls')),
    path("devportal/", include('devportal.urls')),
    path('admin/', admin.site.urls),
]

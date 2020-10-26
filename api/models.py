from django.db import models


class Developer(models.Model):
    auto_increment_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    bio = models.TextField()
    price = models.DecimalField(max_digits=5, decimal_places=2)

    def __str___(self):
        return self.name


class Project(models.Model):
    auto_increment_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    developers = models.ManyToManyField(Developer)
    budget = models.DecimalField(max_digits=1000, decimal_places=2)

    def __str___(self):
        return self.title

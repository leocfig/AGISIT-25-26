from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

class RegistrationSerializaer(serializers.ModelSerializer):

    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
            'password': {
                'write_only': True,
                'required': True,
                'validators': [validate_password]
            }
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])
        user.save()

        return user
    def to_representation(self, instance): 
        """
        After account creation, creation of the token for the online part
        """
        refresh = RefreshToken.for_user(instance)
        return {
            "user_id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }



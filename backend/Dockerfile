FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Books.Api/Books.Api.csproj", "Books.Api/"]
RUN dotnet restore "Books.Api/Books.Api.csproj"
COPY . .
WORKDIR "/src/Books.Api"
RUN dotnet publish "Books.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Books.Api.dll"]
